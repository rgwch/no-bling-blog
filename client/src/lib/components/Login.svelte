<script lang="ts">
    import { currentJWT, currentUser } from "../store";
    import { login } from "../io";
    let username = "";
    let password = "";
    let errmsg = "";
    let open = false;
    async function doLogout() {
        $currentJWT = "";
        $currentUser = { name: "visitor", role: "visitor" };
    }
</script>

<div class="flex flex-row">
    {#if $currentUser?.role == "visitor" || $currentUser?.role == undefined}
        {#if open}
            {#if errmsg}
                <span class="text-red-600">{errmsg}</span>
            {/if}
            <input
                class="text-sm"
                type="text"
                placeholder="username"
                bind:value={username} />
            <input
                class="text-sm"
                type="password"
                placeholder="passwort"
                bind:value={password} />
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => login(username, password)}>Login</button>
        {:else}
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => (open = true)}>Login</button>
        {/if}
    {:else}
        <button class="text-sm px-3 hover:text-blue-500" on:click={doLogout}
            >{$currentUser.name}</button>
    {/if}
</div>
