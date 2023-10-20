<script lang="ts">
    import type { post } from "../types";
    import Post from "../components/Post.svelte";
    import { navigate } from "svelte-routing";
    import Filter from "../components/Filter.svelte";
    import { _ } from "svelte-i18n";
    import { currentPost } from "../store";
    import { currentUser } from "../user";
    import { request } from "../io";
    let categories: Array<string> = [];
    let posts: Array<post> = [];
    let years: Array<string> = [];
    let filterText = "";
    let currentCategory = "";
    let yearFrom = "";
    let yearUntil = "";

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
        currentUser.setExpirationTime(result.expiration)
    });
    doFilter();
    async function doFilter() {
        // console.log(new Date().toString()+":"+$currentJWT)
        let filters = [];
        if (filterText.length) {
            filters.push(`text=${filterText.toLocaleLowerCase()}`);
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
        navigate("/post/" + p._id);
    }
    function createNew() {
        const np: post = {
            heading: "",
            teaser: "",
            fulltext: "",
            category: "",
            author: $currentUser.name,
            published: false,
        };
        $currentPost = np;
        navigate("/new");
    }
</script>

<div
    class="flex flex-col justify-center content-stretch md:flex-row mx-5 m-2 p-1 text-sm">
    <div class="flex flex-row">
        <Filter
            caption={$_("fromyear")}
            choices={years}
            bind:val={yearFrom}
            on:changed={doFilter} />
        <Filter
            caption={$_("untilyear")}
            choices={years}
            bind:val={yearUntil}
            on:changed={doFilter} />
        <Filter
            caption={$_("category")}
            choices={categories}
            bind:val={currentCategory}
            on:changed={doFilter} />
    </div>
    <div class="flex flex-row">
        <Filter
            caption={$_("text")}
            bind:val={filterText}
            on:changed={doFilter} />

        {#if $currentUser?.role == "admin" || $currentUser?.role == "editor"}
            <button class="pt-3 mt-2" on:click={createNew}
                ><img src="/page_add.png" alt="add post" /></button>
        {/if}
    </div>
</div>

<div class="flex flex-row m-5 flex-wrap justify-center">
    {#each posts as post}
        <Post item={post} on:load={() => load(post)} />
    {/each}
</div>
