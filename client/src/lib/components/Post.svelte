<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DateTime } from 'luxon';
    import type { post } from '../types';
    import { _ } from 'svelte-i18n';
    export let item: post;
    const dispatch = createEventDispatcher();
    function formatTime(time?: string) {
        const dt = DateTime.fromISO(time ?? new Date().toISOString());
        if (dt.hour) {
            return dt.toFormat('yyyy-MM-dd - HH:mm');
        } else {
            return dt.toFormat('yyyy-MM-dd');
        }
    }
    function keypress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            dispatch('load', item._id);
        }
    }
</script>

<div
    class="data"
    on:click={() => dispatch('load', item._id)}
    on:keypress={keypress}
    role="button"
    tabindex="0">
    <p class="mx-6 mb-2 py-1 text-xs font-bold text-blue-400 w-full">
        {item.category}
    </p>

    <h1 class="text-blue-300 font-semibold text-2xl mx-5 capitalize w-full">
        {item.heading}
    </h1>
    <p class="mx-6 mb-2 w-full">{@html item.teaser}</p>
    <p class="text-xs mt-3 text-blue-400">
        {formatTime(item.created?.toString())}
        {#if !item.published}
            &nbsp;({$_('draft')})
        {/if}
    </p>
</div>

<style>
    .data {
        font-family: 'Lato', sans-serif;
        margin: 20px;
        padding: 20px;
        border-radius: 15px;
        background-color: #242d3d;
        color: #1ebad5;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: stretch;
        align-items: center;
        text-align: center;
        width: 350px;
    }
</style>
