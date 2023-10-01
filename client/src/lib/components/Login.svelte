<script lang="ts">
    import { currentJWT, currentRole } from '../store.ts';
    import { login } from '../io.ts';
    let username = '';
    let password = '';
    let errmsg = '';
    async function doLogin() {
        const ok = await login(username, password);
        if (!ok) {
            errmsg = 'fehler';
        }
    }
    async function doLogout() {
        $currentJWT = '';
        $currentRole = 'visitor';
    }
</script>

<div class="flex flex-row">
    {#if $currentRole == 'visitor' || $currentRole == undefined}
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
        <button class="text-sm px-3 hover:text-blue-500" on:click={doLogout}>{$currentRole}</button>
    {/if}
</div>
