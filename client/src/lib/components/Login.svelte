<script lang="ts">
    import { currentJWT, currentUser } from '../store';
    import { _ } from 'svelte-i18n';
    import { login } from '../io';
    let username = '';
    let password = '';
    let errmsg = '';
    let open = false;
    async function doLogout() {
        $currentJWT = '';
        $currentUser = { name: 'visitor', role: 'visitor' };
        open = false;
    }
</script>

<div class="flex flex-col md:flex-row">
    {#if $currentUser?.role == 'visitor' || $currentUser?.role == undefined}
        {#if open}
            {#if errmsg}
                <span class="text-red-600">{errmsg}</span>
            {/if}
            <input
                class="text-sm"
                type="text"
                placeholder={$_('username')}
                bind:value={username} />
            <input
                class="text-sm"
                type="password"
                placeholder={$_('password')}
                bind:value={password} />
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => login(username, password)}
                >{$_('login')}</button>
        {:else}
            <button
                class="text-sm px-3 hover:text-blue-500"
                on:click={() => (open = true)}>{$_('login')}</button>
        {/if}
    {:else}
        <button class="text-sm px-3 hover:text-blue-500" on:click={doLogout}
            >{$currentUser.name}</button>
    {/if}
</div>
