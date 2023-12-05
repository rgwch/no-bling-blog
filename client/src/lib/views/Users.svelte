<script lang="ts">
    import { type user } from "../types";
    import { request } from "../io";
    import { _ } from "svelte-i18n";
    let users: Array<user> = [];
    let newUser: user = {
        name: "",
        label: "",
        role: "editor",
    };
    request("admin/users").then((result) => {
        users = result.map((u: user) => {
            u.label = u.label ?? u.name;
            return u;
        });
    });
    async function remove(user: user) {
        await request(`admin/deluser/${user.name}`);
        users = users.filter((u) => u.name !== user.name);
    }
    async function modify(user: user) {
        await request(`admin/moduser/${user.name}`);
    }
    async function addUser() {
        await request(
            `admin/adduser/${newUser.name}/${newUser.role}/${newUser.label}`,
        );
        users=[...users,newUser]
        newUser = {
            name: "",
            label: "",
            role: "editor",
        };
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
                    <td contenteditable="true" bind:innerText={user.label}></td>
                    <td>
                        <select bind:value={user.role}>
                            <option value="admin">admin</option>
                            <option value="editor">editor</option>
                        </select>
                    </td>
                    <td class="p-4">
                        <button class="btn" on:click={() => remove(user)}
                            >{$_("delete")}</button>
                        <button class="btn" on:click={() => modify(user)}
                            >{$_("edit")}</button>
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
                <td
                    ><input
                        type="text"
                        placeholder={$_("role")}
                        bind:value={newUser.role} /></td>
                <td
                    ><button class="btn mx-3" on:click={addUser}
                        >{$_("add")}</button
                    ></td>
            </tr>
        </tbody>
    </table>
</div>
