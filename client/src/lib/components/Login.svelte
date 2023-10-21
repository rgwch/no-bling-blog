<script lang="ts">
    import { _ } from "svelte-i18n";
    import { currentUser, User, type userType } from "../user";
    let username = "";
    let password = "";
    let errmsg = "";
    let open = false;
    let actUser: userType;
    let loggedIn = false;
    currentUser.subscribe((u: userType) => {
        actUser = u;
        loggedIn = currentUser.isLoggedIn();
    });
    function logout(){
        currentUser.logout();
        loggedIn = false;
        open=false
    }
</script>

<div class="flex flex-col md:flex-row">
    {#if !loggedIn}
        {#if open}
            {#if errmsg}
                <span class="text-red-600">{errmsg}</span>
            {/if}
            <input
                class="text-sm"
                type="text"
                placeholder={$_("username")}
                bind:value={username} />
            <input
                class="text-sm"
                type="password"
                placeholder={$_("password")}
                bind:value={password} />
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => currentUser.login(username, password)}
                >{$_("login")}</button>
        {:else}
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => (open = true)}>{$_("login")}</button>
        {/if}
    {:else}
        <button
            class="text-sm px-3 hover:text-blue-500"
            on:click={logout}>{$currentUser.name}</button>
    {/if}
</div>
