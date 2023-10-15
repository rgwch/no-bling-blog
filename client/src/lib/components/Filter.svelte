<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    export let choices: Array<string> | null = null;
    export let val: string;
    export let caption = '';
    const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col p-2">
    <div class="whitespace-nowrap">
        {caption}
    </div>
    <div>
        {#if choices}
            <select
                bind:value={val}
                on:change={() => dispatch('changed')}
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                {#each choices as choice}
                    <option value={choice}>{choice}</option>
                {/each}
            </select>
        {:else}
            <input
                type="text"
                class="block w-full rounded-md border-0 py-0.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                bind:value={val}
                on:focusout={() => dispatch('changed')} />
        {/if}
    </div>
</div>
