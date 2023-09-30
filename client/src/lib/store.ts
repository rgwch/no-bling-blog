import { writable, type Writable } from 'svelte/store'
import type { post } from './types'

export const currentView: Writable<ConstructorOfATypedSvelteComponent> = writable()
export const currentPost: Writable<post> = writable()
export const currentJWT: Writable<string> = writable()
export const currentRole: Writable<string> = writable()
