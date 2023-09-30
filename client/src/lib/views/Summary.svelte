<script lang="ts">
    import env from '../environment';
    import type { post } from '../types';
    import Post from '../components/Post.svelte';
    import Filter from '../components/Filter.svelte';
    import { currentView, currentPost } from '../store';
    import { request } from '../io';
    import Single from '../views/Single.svelte';
    let categories: Array<string> = [];
    let posts: Array<post> = [];
    let filterSummary = '';
    let currentCategory = '';
    let filterFulltext = '';
    let role = '';
    doFilter();
    async function changeCat() {
        const result = await fetch(
            env.url + 'summary?category=' + currentCategory
        );
        if (result.ok) {
            const retval = await result.json();
            if (retval.status == 'ok') {
                posts = retval.result;
            }
        }
    }
    async function doFilter() {
        let filters = [];
        if (filterFulltext.length) {
            filters.push(`fulltext=${filterFulltext}`);
        }
        if (filterSummary.length) {
            filters.push(`summary=${filterSummary}`);
        }
        if (currentCategory != '') {
            filters.push(`category=${currentCategory}`);
        }

        posts = await request('summary', filters);

        const cats = posts.map((post) => post.category);
        categories = ['', ...new Set(cats)];
    }
    function load(p: post) {
        $currentPost = p;
        $currentView = Single;
    }
</script>

<div
    class="flex flex-row flex-nowrap mx-5 m-2 p-1 text-sm border-blue-400 rounded-md border-2">
    <Filter
        caption="Kategorie"
        choices={categories}
        bind:val={currentCategory}
        on:changed={changeCat} />
    <Filter
        caption="Zusammenfassung"
        bind:val={filterSummary}
        on:changed={doFilter} />
    <Filter
        caption="Volltext"
        bind:val={filterFulltext}
        on:changed={doFilter} />
    <a href={env.url + 'login/admin/secret'}>{role}</a>
</div>

<div class="flex flex-row m-5 flex-wrap justify-center">
    {#each posts as post}
        <Post item={post} on:load={() => load(post)} />
    {/each}
</div>
<!-- button on:click={()=>create(null)}>Send</button -->
