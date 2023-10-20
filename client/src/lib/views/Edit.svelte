<script lang="ts">
    import type { post } from '../types';
    import { request, write, api } from '../io';
    import { currentPost, currentUser } from '../store';
    import {navigate} from 'svelte-routing';
    import Summary from './Summary.svelte';
    import { _ } from 'svelte-i18n';
    let sayok: boolean = false;
    async function doSave() {
        await write('add', $currentPost).then((result) => {
            sayok = true;
            setTimeout(() => (sayok = false), 2000);
        });
    }
    async function doUpload(event: any) {
        console.log('upload');
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const headers: any = {
            // 'content-type': 'multipart/form-data',
        };
        headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');

        const options = {
            method: 'POST',
            headers,
            body: formData,
        };
        try {
            const result = await fetch(api + 'upload', options);
            console.log(result.ok);
            sayok = true;
            setTimeout(() => (sayok = false), 2000);
        } catch (err) {
            alert(err);
        }
    }
</script>

<div class="flex flex-col">
    <input
        class="m-1 p-2 border border-blue-300"
        type="text"
        placeholder={$_('category')}
        bind:value={$currentPost.category} />
    <input
        class="m-1 p-2 border border-blue-300"
        type="text"
        placeholder={$_('title')}
        bind:value={$currentPost.heading} />
    <textarea
        class="m-1 p-2 border border-blue-300"
        placeholder={$_('summary')}
        bind:value={$currentPost.teaser} />
    <textarea
        class="m-2 p-3 border border-blue-300 h-96"
        placeholder={$_('fulltext')}
        bind:value={$currentPost.fulltext} />

    <div class="flex flex-row">
        <button class="btn" on:click={doSave}>{$_('save')}</button>
        <p class:hidden={!sayok}>Ok!</p>
        <button class="btn" on:click={() => (navigate('/'))}
            >{$_('cancel')}</button>
        <form class="p-1 border border-blue-300" on:submit={doUpload} method="post" enctype="multipart/form-data">
            <input type="file" name="file" id="file" />
            <button class="btn">{$_('upload')}</button>
        </form>
    </div>
</div>

<style>
    .field {
        @apply m-2 p-3 border border-blue-300;
    }
</style>
