<script lang="ts">
    import { stringify } from "postcss";

  export let data:Array<any>=[];
  
</script>
<h1>No-Bling-Blog</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{#each data as item}
<p>{JSON.stringify(item)}</p>
{/each}
I