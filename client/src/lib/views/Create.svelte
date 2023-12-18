<script lang="ts">
    import type { post } from "../types";
    import { request, write, api } from "../io";
    import { currentUser } from "../user";
    import { navigate } from "svelte-routing";
    import { _ } from "svelte-i18n";
    let sayok: boolean = false;
    let categories: Array<string> = [];
    request("stats").then((result) => {
        categories = result.categories.sort((a: string, b: string) =>
            a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
        );
    });
    let current: post = {
        heading: "",
        teaser: "",
        fulltext: "",
        category: "",
        created: new Date(),
        published: false,
        featured: false,
        priority: 0,
        author: $currentUser.label ?? $currentUser.name,
    };
    async function doSave() {
        await write("add", current).then((result) => {
            if (result?.status == "ok") {
                current = result.result;
                sayok = true;
                setTimeout(() => (sayok = false), 2000);
                navigate("/post/" + current._id);
            } else {
                alert(result?.message);
            }
        });
    }
    async function doUpload(event: any) {
        console.log("upload");
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const headers: any = {
            // 'content-type': 'multipart/form-data',
        };
        headers["Authorization"] = "Bearer " + localStorage.getItem("token");

        const options = {
            method: "POST",
            headers,
            body: formData,
        };
        try {
            const result = await fetch(api + "upload", options);
            console.log(result.ok);
            sayok = true;
            setTimeout(() => (sayok = false), 2000);
        } catch (err) {
            alert(err);
        }
    }
    function newCat() {
        const newcat = prompt($_("newcat"));
        if (newcat) {
            categories = [...categories, newcat].sort((a, b) =>
                a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
            );
            current.category = newcat;
        }
    }
</script>

<div class="flex flex-col prose m-2">
    <div class="flex flex-row w-full ml-2 pr-5">
        <select bind:value={current.category} class="flex-1">
            {#each categories as choice}
                <option value={choice}>{choice}</option>
            {/each}
        </select>
        <button class="btn ml-2" on:click={newCat}>{$_("newcat")}</button>
    </div>
    <input
        class="field"
        type="text"
        placeholder={$_("title")}
        bind:value={current.heading} />
    <textarea
        class="field"
        placeholder={$_("summary")}
        bind:value={current.teaser} />
    <textarea
        class="field h-96"
        placeholder={$_("fulltext")}
        bind:value={current.fulltext} />

    <div class="flex flex-row">
        <button class="btn" on:click={doSave}>{$_("save")}</button>
        <p class:hidden={!sayok}>Ok!</p>
        <button class="btn" on:click={() => navigate("/")}
            >{$_("cancel")}</button>
    </div>
    <form
        class="p-1 border border-blue-300"
        on:submit={doUpload}
        method="post"
        enctype="multipart/form-data">
        <input type="file" name="file" id="file" />
        <button class="btn">{$_("upload")}</button>
    </form>
</div>

<style>
    .field {
        @apply m-2 p-3 border border-blue-300;
    }
</style>
