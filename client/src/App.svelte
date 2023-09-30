<script lang="ts">
  import { currentView } from './lib/store';
  import Summary from './lib/views/Summary.svelte';
  $currentView = Summary;
</script>

<main>
  <svelte:component this={$currentView} />
</main>

<style>
  .response {
    margin-top: 100px;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
</style>
