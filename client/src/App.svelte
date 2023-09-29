<script lang="ts">
  import type { post } from './lib/types';
  import env from './lib/environment';
  import Post from './lib/components/Post.svelte';
  import Filter from './lib/components/Filter.svelte';
  let posts: Array<post> = [];
  let categories: Array<string> = [];
  let currentCategory = '';
  let filterFulltext = '';
  let filterSummary=""
  fetch(env.url + 'summary').then(async (result) => {
    if (result.ok) {
      const ans = await result.json();
      if (ans.status == 'ok') {
        posts = ans.result;
        const cats = posts.map((post) => post.category);
        categories = ["",...new Set(cats)];
      }
    }
  });
  async function create(p: post) {
    fetch(env.url + 'add', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(p),
    });
  }
  async function changeCat() {
    const result = await fetch(env.url + 'summary?category=' + currentCategory);
    if (result.ok) {
      const retval = await result.json();
      if (retval.status == 'ok') {
        posts = retval.result;
      }
    }
  }
  async function doFilter() {
    let filters=""
    if(filterFulltext.length){
      filters="?fulltext="+filterFulltext
    }
    if(filterSummary.length){
      if(filters.length){
        filters+=`&summary=${filterSummary}`
      }else{
        filters+=`?summary=${filterSummary}`
      }
    }

    const result = await fetch(env.url + 'summary'+filters);
    if (result.ok) {
      const retval = await result.json();
      if (retval.status == 'ok') {
        posts = retval.result;
      }
    }
  }
</script>

<main>
  <div class="flex flex-row flex-nowrap m-5 p-5 border-blue-400 rounded-md border-2">
    <Filter
      caption="Kategorie"
      choices={categories}
      bind:val={currentCategory}
      on:changed={changeCat} />
    <Filter caption="Zusammenfassung" bind:val={filterSummary} on:changed={doFilter}></Filter>
    <Filter caption="Volltext" bind:val={filterFulltext} on:changed={doFilter} />
  </div>

  <div class="flex flex-row m-5 flex-wrap justify-center">
    {#each posts as post}
      <Post item={post} />
    {/each}
  </div>
  <!-- button on:click={()=>create(null)}>Send</button -->
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
