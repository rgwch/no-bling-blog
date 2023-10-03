<script lang="ts">
  import { currentView } from "./lib/store";
  import Summary from "./lib/views/Summary.svelte";
  import Login from "./lib/components/Login.svelte";
  $currentView = Summary;

</script>

<main>
  <div class="container mx-auto">
    <div class="bg-blue-200 flex flex-row flex-nowrap mx-5 px-5">
      <h1 class="text-lg cursor-pointer" on:click={()=>{$currentView=Summary}}>The No Bling Blog</h1>
      <div class="flex-1" />
      <Login />
    </div>

    <svelte:component this={$currentView} />
  </div>
</main>

