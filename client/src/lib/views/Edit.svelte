<script lang="ts">
    import type { post } from '../types';
    import { request, write } from '../io';
    import { currentPost, currentView } from '../store';
    
    async function doSave() {
        await write("add",$currentPost)
    }
</script>

<div class="flex flex-col">
    <input class="m-2 p-3 border border-blue-300" type="text" placeholder="Kategorie" bind:value={$currentPost.category}>
    <input class="m-2 p-3 border border-blue-300" type="text" placeholder="titel" bind:value={$currentPost.heading} />
    <textarea class="m-2 p-3 border border-blue-300" placeholder="Zusammenfassung" bind:value={$currentPost.teaser}></textarea>
    <textarea class="m-2 p-3 border border-blue-300" placeholder="Volltext oder Verweis" bind:value={$currentPost.fulltext}></textarea>
    
    <button on:click={doSave}>Speichern</button>
</div>

<style>
    .field{
        @apply m-2 p-3 border border-blue-300;
    }
</style>