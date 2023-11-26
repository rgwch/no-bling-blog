<script lang="ts">
  import { request } from '../io';
  import { DateTime } from 'luxon';
  import type { post } from '../types';
  export let currentID: string;
  let posts: Array<post> = [];
  async function reset() {
    if (currentID) {
      const current = await request('meta/' + currentID);
      const actDate = DateTime.fromJSDate(new Date(current.created as Date));
      const begin = actDate.minus({ months: 6 });
      const end = actDate.plus({ months: 6 });
      let filters = [];
      filters.push(`between=${begin.toISODate()},${end.toISODate()}`);
      posts = await request('summary', filters);
    }
  }
  reset();
  function date(dt: Date | undefined) {
    return DateTime.fromJSDate(new Date(dt as Date)).toFormat('dd.LL.yyyy');
  }
</script>

<div class="bg-gray-200 mt-2 p-1 h-[75vh] overflow-auto">
  {#each posts as post}
    <div class="mt-2 hover:text-blue-600 text-sm">
      <p class="text-gray-500 text-xs">{date(post.created)}:</p>
      <a href="/post/{post._id}">{post.heading}</a>
    </div>
  {/each}
</div>
