<script>
    import "../app.css";
 
</script>

<div class="w-full">
    <h1>The No-Bling Blog</h1>
    <slot />
</div>

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
