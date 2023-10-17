<script lang="ts">
    import { currentView, currentPost, currentUser } from "../store";
    import { DateTime } from "luxon";
    import type { post } from "../types";
    import { request, write } from "../io";
    import Summary from "./Summary.svelte";
    import { _ } from "svelte-i18n";
    import { readable } from "svelte/store";
    let post: post;
    let editmode = false;
    let date: string = "";
    let modified: string = "";

    reload();

    function reload() {
        request("read/" + $currentPost._id, [`raw=${editmode}`]).then(
            async (result) => {
                if (result) {
                    post = result;
                    date = DateTime.fromJSDate(new Date(result.created)).toFormat($_("dateformat"));
                    modified = DateTime.fromJSDate(new Date(result.modified)).toFormat($_("dateformat"));
                }
            }
        );
    }
    function back() {
        $currentView = Summary;
    }
    async function doDelete() {
        if (confirm($_("suredelete"))) {
            const result = await request("delete/" + $currentPost._id);
            if (result) {
                $currentView = Summary;
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
        const dt = DateTime.fromFormat(date, $_("dateformat"));
        if (dt.isValid) {
            post.created = dt.toJSDate();
        }else{
            alert($_("invaliddate"));
            return;
        }
        await write("update", post);
        editmode = false;
        await reload();
    }
    async function doSaveMeta() {
        await write("updatemeta", post);
    }
    async function doExport(){
        await request("export/" + $currentPost._id)
    }
    $: canEdit = () => {
        if ($currentUser.role == "admin") {
            return true;
        }
        if ($currentUser.role == "editor") {
            return $currentUser.name == post.author;
        }
        return false;
    };
</script>

{#if post}
    {#if editmode}
        <div
            class="bg-blue-200 border-blue-600 border-2 rounded-md my-3 mx-5 p-2">
            <div
                contenteditable="true"
                class="text-blue-800 font-bold text-lg mb-4 text-center"
                bind:innerText={post.heading} />
            <p class="text-sm">{$_("summary")}:</p>
            <div
                class="border border-sm border-blue-600 mb-2 p-1"
                contenteditable="true"
                bind:innerText={post.teaser} />
            <p class="text-sm">{$_("fulltext")}:</p>
            <div
                class="border border-sm border-blue-600 mb-2 p-1"
                contenteditable="true"
                bind:innerText={post.fulltext} />
            <div class="text-sm font-light italic">
                {$_("category")}:
                <span contenteditable="true" bind:textContent={post.category}
                    >{post.category}</span>
                <span
                    class="ml-5"
                    contenteditable="true"
                    bind:textContent={post.author}
                    >{$_("author")}: {post.author}</span>
                <span
                    class="ml-5"
                    contenteditable="true"
                    bind:textContent={date}
                    >{$_("created")}: {date}</span>
                <span class="ml-5">{$_("modified")}: {modified}</span>
            </div>
        </div>
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doSaveAll}>{$_("save")}</button>
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doEdit}>{$_("cancel")}</button>
        <span
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md">
            <span>{$_("published")}: </span>
            <input
                type="checkbox"
                bind:checked={post.published}
                on:click={doSaveAll} />
        </span>
    {:else }     
        <div
            class="mx-auto prose md:prose-lg border-blue-600 rounded-md my-3 mx-5 p-5">
            <div class="text-blue-800 font-bold text-lg mb-4 text-center">
                {post.heading}
            </div>
            <div>{@html post.fulltext}</div>
            <div class="text-sm font-light italic border border-t-blue-700 flex">
                <span>{$_("category")}:
                {post.category}</span>
                <span class="ml-5">{$_("author")}: {post.author}</span>
                <span class="ml-5">{$_("created")}: {date}</span>
                <span class="ml-5">{$_("modified")}: {modified}</span>
            </div>
        </div>
        {#if canEdit()}
            <button class="btn" on:click={doDelete}>{$_("delete")}</button>
            <button class="btn" on:click={doEdit}>{$_("edit")}</button>
            <span class="btn">
                <span>{$_("published")}: </span>
                <input
                    type="checkbox"
                    bind:checked={post.published}
                    on:change={doSaveMeta} />
            </span>
            <button class="btn" on:click={doExport}>{$_("export")}</button>
        {/if}
    {/if}
{:else}
    <div>No Text</div>
{/if}
<button class="btn" on:click={back}>{$_("back")}</button>
