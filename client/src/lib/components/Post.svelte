<script lang="ts">
    import type { post } from "../types";
    export let item: post;
</script>

<div class="data">
    <h1 class="text-blue-300 font-semibold text-lg mx-5">{item.heading}</h1>
    <p class="mx-6">
        <span class="p-2">Kategorie:</span><span>{item.category}</span>
    </p>
    <p class="mx-6 mb-2">{item.teaser}</p>
</div>

<style>
    .data {
        font-family: "Lato", sans-serif;
        margin: 20px;
        padding: 20px;
        border-radius: 15px;
        background-color: #242d3d;
        color: #1ebad5;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        text-align: center;
        width: 25%;
    }
</style>
