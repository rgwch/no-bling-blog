<script lang="ts">
  import type { post } from './lib/types';
  import env from './lib/environment';
  import Post from './lib/components/Post.svelte';
  let posts: Array<post> = [];
  let categories: Array<string> = [];
  let currentCategory = '';
  let filter = '';
  fetch(env.url + 'summary').then(async (result) => {
    if (result.ok) {
      const ans = await result.json();
      if (ans.status == 'ok') {
        posts = ans.result;
        const cats = posts.map((post) => post.category);
        categories = [...new Set(cats)];
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
    const result = await fetch(env.url + 'summary?matching=' + filter);
    if (result.ok) {
      const retval = await result.json();
      if (retval.status == 'ok') {
        posts = retval.result;
      }
    }
  }
</script>

<main>
  <div class="w-full m-5 p-5">
    <select bind:value={currentCategory} on:change={changeCat}>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
    <input
      type="text"
      placeholder="Filtern"
      bind:value={filter}
      on:focusout={doFilter} />
  </div>
  <div class="response">
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

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
