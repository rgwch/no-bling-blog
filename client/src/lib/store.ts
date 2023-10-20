import { get, writable, type Writable } from 'svelte/store'
import type { post, user } from './types'
import { request, getUser } from './io'
// export const currentView: Writable<ConstructorOfATypedSvelteComponent> = writable()
export const currentPost: Writable<post> = writable()
export const expiration: Writable<number> = writable(3600)

// export const currentUser: Writable<user> = writable()


function createUser() {

    const internal = writable<user>(getUser())

    function set(u: user) {
        internal.set(u)
    }

    function expire(seconds:number){

    }
    function expired():boolean {
        const now = new Date().getTime() / 1000
        return now + get(expiration) > get(internal).exp
    }
    return {
        set,
        update: internal.update,
        subscribe: internal.subscribe,
       
    }
}

export const currentUser = createUser()