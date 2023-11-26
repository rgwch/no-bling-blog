<script lang="ts">
  import Summary from "./Summary.svelte";
  import Featured from "./Featured.svelte";
</script>

<div class="gridle">
  <div class="invisible md:visible md:bg-gray-200"><Featured /></div>
  <div><Summary /></div>
</div>

<style>
  .gridle {
   display: grid;
    gap: 0px 2px;
    justify-items: stretch;
    align-items: top;
  }
  @media (min-width: 768px) {
    .gridle {
      display: grid;
      grid-template: 1fr/1fr 6fr;
      gap: 0px 2px;
      justify-items: stretch;
      align-items: top;
    }
  }
  
</style>
