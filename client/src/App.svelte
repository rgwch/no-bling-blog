<script lang="ts">
  import type { post } from "./lib/types";
  import Post from "./lib/components/Post.svelte";
  const prefix = "/api/1.0/";
  let posts: Array<post> = [];
  let categories: Array<string>=[]  
  fetch(`http://localhost:3000${prefix}summary`).then(async (result) => {
    if (result.ok) {
      const ans = await result.json();
      if (ans.status == "ok") posts = ans.result;
      const cats=posts.map(post=>post.category)
      categories=[...new Set(cats)]
    }
  });
  async function create(p: post) {
    fetch(`http://localhost:3000${prefix}add`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(p),
    });
  }
  async function changeCat(event:any){
    
  }
</script>

<main>
  <div class="w-full m-5 p-5">
    <select on:change={changeCat}>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
    <input type="text" placeholder="Filtern">
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
