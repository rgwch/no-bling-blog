<script lang="ts">
  let maintext: any;
</script>

<form method="POST">
  <div class="w-full">
    <div class="mb-2 w-full">
      <input class="w-full" type="text" placeholder="category" />
    </div>
    <div class="mb-2 w-full border-light-50">
      <input class="w-full" type="text" placeholder="keywords" />
    </div>
    <p>teaser</p>
    <textarea class="border-dark-600 w-full" />
    <p>main</p>
    <textarea bind:this={maintext} class="border-gray-700 bg-blue-200 w-full" />
  </div>
  <input type="submit" value="ok" />
</form>
