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
    function logout() {
        currentUser.logout();
        loggedIn = false;
        open = false;
    }
    async function login() {
        if (username == "" || password == "") {
            errmsg = $_("empty_usr");
            return;
        }
        if (await currentUser.login(username, password)) {
            loggedIn = true;
            open = false;
            errmsg=""
        }else{
            errmsg = $_("wrong_usr");
        }
    }
</script>

<div class="flex flex-col md:flex-row">
    {#if !loggedIn}
        {#if open}
            <div class="flex flex-col">
                <div class="flex flex-row">
                    <input
                        class="input text-sm"
                        type="text"
                        placeholder={$_("username")}
                        bind:value={username} />
                    <input
                        class="input text-sm"
                        type="password"
                        placeholder={$_("password")}
                        bind:value={password} />
                </div>
                {#if errmsg}
                    <span class="text-red-600">{errmsg}</span>
                {/if}
            </div>
            <button
                class="text-2xl md:text-sm px-3 hover:text-blue-500"
                on:click={login}>{$_("login")}</button>
        {:else}
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => (open = true)}>{$_("login")}</button>
        {/if}
    {:else}
        <button class="text-sm px-3 hover:text-blue-500" on:click={logout}
            >{$currentUser.name}</button>
    {/if}
</div>
