<script lang="ts">
    import type { post } from "../types";
    import { request, write } from "../io";
    import { currentPost, currentView } from "../store";
    import Summary from "./Summary.svelte";
    let sayok: boolean = false;
    async function doSave() {
        await write("add", $currentPost).then((result) => {
            sayok = true;
            setTimeout(() => (sayok = false), 2000);
        });
    }
</script>

<div class="flex flex-col">
    <input
        class="m-2 p-3 border border-blue-300"
        type="text"
        placeholder="Kategorie"
        bind:value={$currentPost.category} />
    <input
        class="m-2 p-3 border border-blue-300"
        type="text"
        placeholder="titel"
        bind:value={$currentPost.heading} />
    <textarea
        class="m-2 p-3 border border-blue-300"
        placeholder="Zusammenfassung"
        bind:value={$currentPost.teaser} />
    <textarea
        class="m-2 p-3 border border-blue-300"
        placeholder="Volltext oder Verweis"
        bind:value={$currentPost.fulltext} />

    <div class="flex flex-row">
        <button class="btn" on:click={doSave}>Speichern</button>
        <p class:hidden={!sayok}>Ok!</p>
        <button class="btn" on:click={() => ($currentView = Summary)}
            >Abbrechen</button>
    </div>
</div>

<style>
    .field {
        @apply m-2 p-3 border border-blue-300;
    }
</style>
