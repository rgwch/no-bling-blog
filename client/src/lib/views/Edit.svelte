<script lang="ts">
    import type { post } from '../types';
    import { request } from '../io';
    import { currentPost, currentView } from '../store';
    let post: post;
    request('read/' + $currentPost._id, ['raw=true']).then(async (result) => {
        if (result) {
            post = result;
        }
    });
</script>

<div>
    <input type="text" bind:value={post.heading} />
</div>
