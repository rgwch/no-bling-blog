<script lang="ts">
    import { type user } from "../types";
    import { request } from "../io";
    let users: Array<user> = [];
    request("admin/users").then((result) => {
        users = result.map((u: user) => {
            u.label = u.label ?? u.name;
            return u;
        });
    });
    async function remove(user: user) {
        await request(`admin/deluser/${user.name}`);
    }
    async function modify(user: user) {
        await request(`admin/moduser/${user.name}`);
    }
</script>

<div class="m-2 p-2">
    <table>
        <thead>
            <tr class="text-left">
                <th>Name</th>
                <th>Label</th>
                <th>Role</th>
                <th>Actions</th>
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
                        <button class="btn">delete</button>
                        <button class="btn">modify</button>
                    </td>
                </tr>
            {/each}
            <tr>
                <td><input type="text" placeholder="name" /></td>
                <td><input type="text" placeholder="label" /></td>
                <td><input type="text" placeholder="role" /></td>
                <td><button class="btn mx-3">add</button></td>
            </tr>
        </tbody>
    </table>
</div>
