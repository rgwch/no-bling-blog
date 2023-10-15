<script lang="ts">
    import type { post } from "../types";
    import Post from "../components/Post.svelte";
    import Filter from "../components/Filter.svelte";
    import Edit from "./Edit.svelte";
    import {
        currentView,
        currentPost,
        currentJWT,
        currentUser,
    } from "../store";
    import { request } from "../io";
    import Single from "../views/Single.svelte";
    let categories: Array<string> = [];
    let posts: Array<post> = [];
    let years: Array<string> = [];
    let filterSummary = "";
    let currentCategory = "";
    let currentYear = "";
    let yearFrom = "";
    let yearUntil = "";
    let filterFulltext = "";
    request("stats").then((result) => {
        const dt = new Date(result.startdate);
        const now = new Date().getTime();
        while (dt.getTime() <= now) {
            const year = dt.getFullYear();
            years.push(year.toString());
            dt.setFullYear(year + 1);
        }
        years.push("");
        years = years;
        categories = ["", ...result.categories];
    });
    doFilter();
    async function doFilter() {
        // console.log(new Date().toString()+":"+$currentJWT)
        let filters = [];
        if (filterFulltext.length) {
            filters.push(`fulltext=${filterFulltext.toLocaleLowerCase()}`);
        }
        if (filterSummary.length) {
            filters.push(`summary=${filterSummary.toLocaleLowerCase()}`);
        }
        if (currentCategory != "") {
            filters.push(`category=${currentCategory}`);
        }
        if (yearFrom != "") {
            if (yearUntil != "") {
                filters.push(`between=${yearFrom},${yearUntil}`);
            } else {
                filters.push(`from=${yearFrom}`);
            }
        } else {
            if (yearUntil != "") {
                filters.push(`until=${yearUntil}`);
            }
        }
        posts = await request("summary", filters);
    }
    function load(p: post) {
        $currentPost = p;
        $currentView = Single;
    }
    function createNew() {
        const np: post = {
            heading: "",
            teaser: "",
            fulltext: "",
            category: "",
            author: "",
            published: false,
        };
        $currentPost = np;
        $currentView = Edit;
    }
</script>

<div
    class="flex flex-col justify-center content-stretch md:flex-row mx-5 m-2 p-1 text-sm">
    <div class="flex flex-row">
        <Filter
            caption="Jahr von"
            choices={years}
            bind:val={yearFrom}
            on:changed={doFilter} />
        <Filter
            caption="Jahr bis"
            choices={years}
            bind:val={yearUntil}
            on:changed={doFilter} />
    </div>
    <Filter
        caption="Kategorie"
        choices={categories}
        bind:val={currentCategory}
        on:changed={doFilter} />
    <Filter
        caption="Zusammenfassung"
        bind:val={filterSummary}
        on:changed={doFilter} />
    <Filter
        caption="Volltext"
        bind:val={filterFulltext}
        on:changed={doFilter} />
    {#if $currentUser?.role == "admin" || $currentUser?.role == "editor"}
        <button class="btn" on:click={createNew}>Neu...</button>
    {/if}
</div>

<div class="flex flex-row m-5 flex-wrap justify-center">
    {#each posts as post}
        <Post item={post} on:load={() => load(post)} />
    {/each}
</div>
<!-- button on:click={()=>create(null)}>Send</button -->
