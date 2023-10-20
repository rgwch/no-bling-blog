import { get, writable, type Writable } from 'svelte/store'
import type { post} from './types'
export const currentPost: Writable<post> = writable()


