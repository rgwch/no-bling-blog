<script lang="ts">
  import type {post} from "../types"
  export let item:post
</script>
<h1>{item.heading}</h1>
<p>{item.teaser}</p>

<style>
   .response {
        margin-top: 100px;
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
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