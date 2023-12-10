<script lang="ts">
  import { request } from '../io';
  import type { post } from '../types';

  let posts: Array<post>;
  function reset() {
    posts = [];
    load();
  }
  async function load() {
    posts = await request('summary', ['featured=true']);
  }
  reset();
</script>

<div class="m-1 p-2 bg-gray-200 h-[75vh] overflow-auto">
  {#each posts as post}
    <p class="mt-2 hover:text-blue-600">
      <a href="/post/{post._id}">{post.heading}</a>
    </p>
  {/each}
</div>
