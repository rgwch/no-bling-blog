<script lang="ts">
    import type { post } from "../types";
    import Post from "../components/Post.svelte";
    import { navigate } from "svelte-routing";
    import Featured from "./Featured.svelte";
    import Filter from "../components/Filter.svelte";
    import { _ } from "svelte-i18n";
    import { currentUser } from "../user";
    import { request, api } from "../io";
    import InfiniteScroll from "svelte-infinite-scroll";
    export let currentCategory = "";
    export let yearFrom = "";
    export let yearUntil = "";

    let categories: Array<string> = [];
    let posts: Array<post> = [];
    let newBatch: Array<post> = [];
    let years: Array<string> = [];
    let filterText = "";
    let offset = 0;
    let dlink = "";
    const BATCHSIZE = 36;
    currentUser.subscribe((user) => {
        reset();
    });
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
    // doFilter();
    function reset() {
        posts = [];
        newBatch = [];
        offset = 0;
        doFilter();
    }
    async function doFilter() {
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
        filters.push(`skip=${offset}`);
        filters.push(`limit=${BATCHSIZE}`);
        newBatch = await request("summary", filters);
        offset = offset + newBatch.length;
    }
    $: posts = [...posts, ...newBatch];
    function load(p: post) {
        navigate("/post/" + p._id);
    }
    function createNew() {
        navigate("/new");
    }
    async function backup() {
        dlink = await request("admin/backup");
    }
</script>

<div
    class="flex flex-col justify-center content-stretch md:flex-row mx-5 m-2 p-1 text-sm">
    <div class="flex flex-row">
        <Filter
            caption={$_("fromyear")}
            choices={years}
            bind:val={yearFrom}
            on:changed={reset} />
        <Filter
            caption={$_("untilyear")}
            choices={years}
            bind:val={yearUntil}
            on:changed={reset} />
        <Filter
            caption={$_("category")}
            choices={categories.sort((a, b) =>
                a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
            )}
            bind:val={currentCategory}
            on:changed={reset} />
    </div>
    <div class="flex flex-row">
        <Filter caption={$_("text")} bind:val={filterText} on:changed={reset} />

        {#if $currentUser?.role == "admin" || $currentUser?.role == "editor"}
            <button class="pt-3 mt-2" on:click={createNew}
                ><img src="/page_add.png" alt="add post" /></button>
        {/if}
        {#if $currentUser?.role == "admin"}
            <button class="pt-3 mt-2" on:click={() => navigate("/users")}
                ><img src="/system-users.png" alt="users" /></button>
            <div class="ml-8 flex flex-row items-center pt-2">
                {#if dlink}
                    <a class="btn" href={"/" + dlink} download={dlink}
                        >Download</a>
                {:else}
                    <button class="btn" on:click={backup}
                        >Backup</button>
                {/if}
            </div>
        {/if}
    </div>
</div>

<div class="gridle">
    <div class="invisible h-0 md:visible md:bg-gray-200"><Featured /></div>
    <div
        class="flex flex-row m-5 flex-wrap justify-center overflow-y-scroll h-[75vh]">
        {#each posts as post}
            <Post item={post} on:load={() => load(post)} />
        {/each}
        <InfiniteScroll
            hasMore={newBatch.length > 0}
            threshold={3}
            on:loadMore={() => doFilter()} />
    </div>
</div>

<style>
    .gridle {
        display: grid;
        gap: 0px 2px;
        justify-items: stretch;
        align-items: top;
    }
    @media (min-width: 768px) {
        .gridle {
            display: grid;
            grid-template: 1fr/1fr 6fr;
            gap: 0px 2px;
            justify-items: stretch;
            align-items: top;
        }
    }
</style>
