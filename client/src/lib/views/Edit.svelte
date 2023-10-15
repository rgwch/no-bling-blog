<script lang="ts">
    import type { post } from '../types';
    import { request, write } from '../io';
    import { currentPost, currentView } from '../store';
    import Summary from './Summary.svelte';
    import { _ } from 'svelte-i18n';
    let sayok: boolean = false;
    async function doSave() {
        await write('add', $currentPost).then((result) => {
            sayok = true;
            setTimeout(() => (sayok = false), 2000);
        });
    }
</script>

<div class="flex flex-col">
    <input
        class="m-1 p-2 border border-blue-300"
        type="text"
        placeholder={$_('category')}
        bind:value={$currentPost.category} />
    <input
        class="m-1 p-2 border border-blue-300"
        type="text"
        placeholder={$_('title')}
        bind:value={$currentPost.heading} />
    <textarea
        class="m-1 p-2 border border-blue-300"
        placeholder={$_('summary')}
        bind:value={$currentPost.teaser} />
    <textarea
        class="m-2 p-3 border border-blue-300 h-96"
        placeholder={$_('fulltext')}
        bind:value={$currentPost.fulltext} />

    <div class="flex flex-row">
        <button class="btn" on:click={doSave}>{$_('save')}</button>
        <p class:hidden={!sayok}>Ok!</p>
        <button class="btn" on:click={() => ($currentView = Summary)}
            >{$_('cancel')}</button>
    </div>
</div>

<style>
    .field {
        @apply m-2 p-3 border border-blue-300;
    }
</style>
