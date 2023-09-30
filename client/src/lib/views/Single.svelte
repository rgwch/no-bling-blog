<script lang="ts">
    import env from '../environment';
    import { currentView, currentPost } from '../store';
    import type { post } from '../types';
    let post: post;
    fetch(env.url + 'read/' + $currentPost._id).then(async (result) => {
        if (result.ok) {
            post = (await result.json()).result;
        } else {
            alert(result.statusText);
        }
    });
</script>

{#if post}
    <div class="bg-blue-200 border-blue-600 border-2 rounded-md m-5 p-5">
        <div class="text-sm font-light italic">({post.category})</div>
        <div class="text-blue-800 font-bold text-lg mb-4 text-center">
            {post.heading}
        </div>
        <div>{post.fulltext}</div>
    </div>
{:else}
    <div>No Text</div>
{/if}
<a
    class="m-5 p-2 border-2 border-blue-800 bg-blue-300 rounded-md"
    href="/summary">Zurück</a>
