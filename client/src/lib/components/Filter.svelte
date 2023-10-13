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
            <select bind:value={val} on:change={() => dispatch('changed')}>
                {#each choices as choice}
                    <option value={choice}>{choice}</option>
                {/each}
            </select>
        {:else}
            <input
                type="text"
                bind:value={val}
                on:focusout={() => dispatch('changed')} />
        {/if}
    </div>
</div>
