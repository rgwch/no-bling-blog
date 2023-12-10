<script lang="ts">
    import { type user } from "../types";
    import { request } from "../io";
    import { _ } from "svelte-i18n";
    import { currentUser } from "../user";
    let users: Array<user> = [];
    let newUser: user = {
        name: "",
        label: "",
        role: "editor",
    };
    let modified: any = {};
    request("admin/users").then((result) => {
        users = result.map((u: user) => {
            u.label = u.label ?? u.name;
            return u;
        });
    });
    async function remove(user: user) {
        await request(`admin/deluser/${user.name}`);
        users = users.filter((u) => u.name !== user.name);
        delete modified[user.name];
    }
    async function modify(user: user) {
        await request(`admin/moduser/${user.name}/${user.role}/${user.label}`);
        modified[user.name] = false;
    }
    async function addUser() {
        await request(
            `admin/adduser/${newUser.name}/${newUser.role}/${newUser.label}`,
        );
        users = [...users, newUser];
        newUser = {
            name: "",
            label: "",
            role: "editor",
        };
    }
    function change(user: user) {
        console.log("changing " + user.name);
        //modified={[user.name]:true}
        modified[user.name] = true;
    }
</script>

<div class="m-2 p-2">
    <table>
        <thead>
            <tr class="text-left">
                <th>{$_("username")}</th>
                <th>{$_("label")}</th>
                <th>{$_("role")}</th>
                <th>{$_("actions")}</th>
            </tr>
        </thead>
        <tbody>
            {#each users as user}
                <tr>
                    <td>{user.name}</td>
                    <td
                        contenteditable="true"
                        on:input={() => change(user)}
                        bind:innerText={user.label}></td>
                    <td>
                        <select
                            bind:value={user.role}
                            on:change={() => change(user)}>
                            <option value="admin">admin</option>
                            <option value="editor">editor</option>
                        </select>
                    </td>
                    <td class="p-4">
                        {#if user.name == $currentUser.name}
                            <span class="text-gray-400 mr-4 my-1 p-1"
                                >{$_("delete")}</span>
                        {:else}
                            <button class="btn" on:click={() => remove(user)}
                                >{$_("delete")}</button>
                        {/if}
                        {#if modified[user.name]}
                            <button class="btn" on:click={() => modify(user)}
                                >{$_("save")}</button>
                        {:else}
                            <span class="text-gray-400 mr-4 my-1 p-1"
                                >{$_("save")}</span>
                        {/if}
                    </td>
                </tr>
            {/each}
            <tr>
                <td
                    ><input
                        type="text"
                        placeholder={$_("username")}
                        bind:value={newUser.name} /></td>
                <td
                    ><input
                        type="text"
                        placeholder={$_("label")}
                        bind:value={newUser.label} /></td>
                <td>
                    <select bind:value={newUser.role}>
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                    </select>
                </td>
                <td>
                    {#if newUser.name}
                        <button class="btn mx-3" on:click={addUser}
                            >{$_("add")}</button>
                    {:else}
                        <span class="text-gray-400 mr-4 my-1 p-1"
                            >{$_("add")}</span>
                    {/if}
                </td>
            </tr>
        </tbody>
    </table>
</div>
