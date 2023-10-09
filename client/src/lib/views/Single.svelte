<script lang="ts">
    import env from '../environment';
    import { currentView, currentPost, currentRole } from '../store';
    import type { post } from '../types';
    import { request, write } from '../io';
    import Summary from './Summary.svelte';
    let post: post;
    let editmode = false;
    let title = '';
    let teaser = '';
    let fulltext = '';

    reload();

    async function reload() {
        request('read/' + $currentPost._id, [`raw=${editmode}`]).then(
            async (result) => {
                if (result) {
                    post = result;
                }
            }
        );
    }
    function back() {
        $currentView = Summary;
    }
    function doDelete() {}
    async function doEdit() {
        editmode = !editmode;
        await reload();
    }
    async function doSaveAll() {
        await write('update', post);
        editmode = false;
        await reload();
    }
    async function doSaveMeta() {
        await write('updatemeta', post);
    }
</script>

{#if post}
    {#if editmode}
        <div
            class="bg-blue-200 border-blue-600 border-2 rounded-md my-3 mx-5 p-5">
            <div class="text-sm font-light italic">({post.category})</div>
            <div
                contenteditable="true"
                class="text-blue-800 font-bold text-lg mb-4 text-center"
                bind:textContent={post.heading} />
            <p class="text-sm">Zusammenfassung:</p>
            <div
                class="border border-sm border-blue-600 mb-2"
                contenteditable="true"
                bind:textContent={post.teaser} />
            <p class="text-sm">Volltext</p>
            <div
                class="border border-sm border-blue-600 mb-2"
                contenteditable="true"
                bind:textContent={post.fulltext} />
        </div>
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doSaveAll}>Speichern</button>
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doEdit}>Abbrechen</button>
        <span
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md">
            <span>Publiziert: </span>
            <input
                type="checkbox"
                bind:checked={post.published}
                on:click={doSaveAll} />
        </span>
    {:else}
        <div
            class="bg-blue-200 border-blue-600 border-2 rounded-md my-3 mx-5 p-5">
            <div class="text-sm font-light italic">({post.category})</div>
            <div class="text-blue-800 font-bold text-lg mb-4 text-center">
                {post.heading}
            </div>
            <div>{@html post.fulltext}</div>
        </div>
        {#if $currentRole == 'admin'}
            <button
                class="btn"
                on:click={doDelete}>Löschen</button>
            <button
                class="btn"
                on:click={doEdit}>Editieren</button>
            <span
                class="btn">
                <span>Publiziert: </span>
                <input
                    type="checkbox"
                    bind:checked={post.published}
                    on:change={doSaveMeta} />
            </span>
        {/if}
    {/if}
{:else}
    <div>No Text</div>
{/if}
<button
    class="btn"
    on:click={back}>Zurück</button>
