<script lang="ts">
  import { currentView } from './lib/store';
  import Summary from './lib/views/Summary.svelte';
  import Login from './lib/components/Login.svelte';
  $currentView = Summary;
</script>

<main>
  <div class="bg-green-200 flex flex-row flex-nowrap">
    <h1>The No Bling Blog</h1>
    <div class="flex-1" />
    <Login />
  </div>

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
