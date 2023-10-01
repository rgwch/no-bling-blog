<script lang="ts">
    import env from "../environment";
    import { currentView, currentPost, currentRole } from "../store";
    import type { post } from "../types";
    import { request, write } from "../io";
    import Summary from "./Summary.svelte";
    let post: post;
    request("read/" + $currentPost._id).then(async (result) => {
        if (result) {
            post = result;
        }
    });
    function back() {
        $currentView = Summary;
    }
    function doDelete() {}
    function doEdit() {}
    async function doSave() {
        await write("updatemeta", post);
    }
</script>

{#if post}
    <div class="bg-blue-200 border-blue-600 border-2 rounded-md my-3 mx-5 p-5">
        <div class="text-sm font-light italic">({post.category})</div>
        <div class="text-blue-800 font-bold text-lg mb-4 text-center">
            {post.heading}
        </div>
        <div>{@html post.fulltext}</div>
    </div>
    {#if $currentRole == "admin"}
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doDelete}>Löschen</button>
        <button
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
            on:click={doEdit}>Bearbeiten</button>
        <span
            class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md">
            <span>Publiziert: </span>
            <input
                type="checkbox"
                bind:checked={post.published}
                on:click={doSave} />
        </span>
    {/if}
{:else}
    <div>No Text</div>
{/if}
<button
    class="ml-5 my-2 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
    on:click={back}>Zurück</button>
