<script lang="ts">
  import { currentView } from './lib/store';
  import Summary from './lib/views/Summary.svelte';
  import Login from './lib/components/Login.svelte';
  $currentView = Summary;
  function home() {
    $currentView = Summary;
  }
  function key(event: any) {
    if (event.key === 'Enter') $currentView = Summary;
  }
</script>

<main>
  <div class="container mx-auto">
    <div
      class="bg-blue-200 flex flex-col md:flex-row flex-nowrap items-center mx-5 px-5">
      <div
        class="py-1 mr-2"
        on:click={home}
        on:keypress={key}
        tabindex="0"
        role="button">
        <img src="/nbb_logo.png" alt="NBB Logo" width="64" />
      </div>
      <div class="text-2xl">The No Bling Blog</div>
      <div class="flex-1" />
      <Login />
    </div>

    <svelte:component this={$currentView} />
  </div>
</main>
