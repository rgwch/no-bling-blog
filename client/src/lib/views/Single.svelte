<script lang="ts">
    import { currentUser } from '../user';
    import { navigate } from 'svelte-routing';
    import { DateTime } from 'luxon';
    import type { post } from '../types';
    import { request, write, api } from '../io';
    import { _ } from 'svelte-i18n';
    import Featured from './Featured.svelte';
    import Blogposts from './Blogposts.svelte';
    export let id: string;
    let post: post;
    let editmode = false;
    let date: string = '';
    let modified: string = '';

    reload();

    function reload() {
        request('read/' + id, [`raw=${editmode}`]).then(async (result) => {
            if (result) {
                post = result;
                date = DateTime.fromJSDate(new Date(result.created)).toFormat(
                    $_('dateformat'),
                );
                modified = DateTime.fromJSDate(
                    new Date(result.modified),
                ).toFormat($_('dateformat'));
            }
        });
    }
    function back() {
        navigate('/');
    }
    async function doDelete() {
        if (confirm($_('suredelete'))) {
            const result = await request('delete/' + post._id);
            if (result) {
                navigate('/');
            } else {
                alert(result.message);
            }
        }
    }
    async function doEdit() {
        editmode = !editmode;
        await reload();
    }
    async function doSaveAll() {
        const dt = DateTime.fromFormat(date, $_('dateformat'));
        if (dt.isValid) {
            post.created = dt.toJSDate();
        } else {
            alert($_('invaliddate'));
            return;
        }
        await write('update', post);
        editmode = false;
        await reload();
    }
    async function doSaveMeta() {
        await write('updatemeta', post);
    }
    async function doExport() {
        await request('export/' + post._id);
    }
    $: canEdit = () => {
        if ($currentUser.role == 'admin') {
            return true;
        }
        if ($currentUser.role == 'editor') {
            return (
                $currentUser.name == post.author ||
                $currentUser.label == post.author
            );
        }
        return false;
    };

    function insertTextAtCursor(text: string) {
        let node = document.createTextNode(text);
        let selection = window.getSelection();
        let range = selection?.getRangeAt(0);
        range?.deleteContents();
        range?.insertNode(node);
        selection?.modify('move', 'right', 'character');
    }
    function notab(event: any) {
        if (event.key == 'Tab') {
            event.preventDefault();
            insertTextAtCursor('\u00a0\u00a0\u00a0\u00a0');
            post.fulltext = event.target.innerText;
        }
    }
    function year(date: string | Date | undefined) {
        if (!date) return '';
        return DateTime.fromJSDate(new Date(date)).toFormat('yyyy');
    }
</script>

<div class="gridle">
    <div class="invisible h-0 md:visible md:bg-gray-200"><Featured /></div>
    <div>
        {#if post}
            <p class="text-sm text-gray-400">
                <a href="/">{$_('home')}</a>
                [<a href={`/time/${year(post.created)}`}>{year(post.created)}</a
                >] [<a href={`/cat/${post.category}`}>{post.category}</a>]
            </p>
            {#if editmode}
                <div
                    class="bg-blue-200 border-blue-600 border-2 rounded-md my-3 mx-5 p-2">
                    <div
                        contenteditable="true"
                        class="text-blue-800 font-bold text-lg mb-4 text-center"
                        bind:innerText={post.heading} />
                    <p class="text-sm">{$_('summary')}:</p>
                    <div
                        class="border border-sm border-blue-600 mb-2 p-1"
                        contenteditable="true"
                        bind:innerText={post.teaser} />
                    <p class="text-sm">{$_('fulltext')}:</p>
                    <div
                        class="border border-sm border-blue-600 mb-2 p-1"
                        contenteditable="true"
                        on:keydown={notab}
                        role="textbox"
                        tabindex="-1"
                        bind:innerText={post.fulltext} />
                    <div class="text-sm font-light italic">
                        {$_('category')}:
                        <span
                            contenteditable="true"
                            bind:textContent={post.category}
                            >{post.category}</span>
                        <span
                            class="ml-5"
                            contenteditable="true"
                            bind:textContent={post.author}
                            >{$_('author')}: {post.author}</span>
                        <span
                            class="ml-5"
                            contenteditable="true"
                            bind:textContent={date}
                            >{$_('created')}: {date}</span>
                        <span class="ml-5">{$_('modified')}: {modified}</span>
                    </div>
                </div>
                <button class="btn" on:click={doSaveAll}>{$_('save')}</button>
                <button class="btn" on:click={doEdit}>{$_('cancel')}</button>
                <span class="btn">
                    <span>{$_('published')}: </span>
                    <input
                        type="checkbox"
                        bind:checked={post.published}
                        on:click={doSaveAll} />
                </span>
            {:else}
                <div
                    class="mx-auto prose md:prose-lg border-blue-600 rounded-md my-3 p-5">
                    <div
                        class="text-blue-800 font-bold text-lg mb-4 text-center">
                        {post.heading}
                    </div>
                    <div>{@html post.fulltext}</div>
                    <div
                        class="text-sm font-light italic border border-t-blue-700 flex">
                        <span
                            >{$_('category')}:
                            {post.category}</span>
                        <span class="ml-5">{$_('author')}: {post.author}</span>
                        <span class="ml-5">{$_('created')}: {date}</span>
                        <span class="ml-5">{$_('modified')}: {modified}</span>
                    </div>
                </div>
                {#if canEdit()}
                    <div class="flex justify-center">
                        <button class="btn" on:click={doDelete}
                            >{$_('delete')}</button>
                        <button class="btn" on:click={doEdit}
                            >{$_('edit')}</button>
                        <span class="btn">
                            <span>{$_('published')}: </span>
                            <input
                                type="checkbox"
                                bind:checked={post.published}
                                on:change={doSaveMeta} />
                        </span>
                        <span class="btn">
                            <span>{$_('featured')}: </span>
                            <input
                                type="checkbox"
                                bind:checked={post.featured}
                                on:change={doSaveMeta} />
                        </span>

                        <span class="btn">
                            <span>{$_('priority')}</span>
                            <input
                                class="w-10"
                                type="number"
                                width="2"
                                bind:value={post.priority}
                                on:change={doSaveMeta} />
                        </span>
                        <a
                            class="btn"
                            href={api + 'export/' + post._id}
                            target="_self">Export</a>
                        <button class="btn" on:click={back}
                            >{$_('back')}</button>
                    </div>
                {:else}
                    <div class="flex justify-center">
                        <button class="btn" on:click={back}
                            >{$_('back')}</button>
                    </div>
                {/if}
            {/if}
        {:else}
            <div>No Text</div>
        {/if}
    </div>
    <div class="invisible h-0 md:visible"><Blogposts currentID={id} /></div>
</div>

<style>
    .gridle {
        display: grid;
        gap: 0px 2px;
        justify-items: stretch;
        align-items: top;
    }
    @media (min-width: 768px) {
        .gridle {
            display: grid;
            grid-template: 1fr/1fr 6fr 1fr;
            gap: 0px 2px;
            justify-items: stretch;
            align-items: top;
        }
    }
</style>
