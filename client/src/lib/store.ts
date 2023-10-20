import { get, writable, type Writable } from 'svelte/store'
import type { post, user } from './types'
import {request} from './io'

// export const currentView: Writable<ConstructorOfATypedSvelteComponent> = writable()
export const currentPost: Writable<post> = writable()
// export const currentUser: Writable<user> = writable()

function getUser(): user {
  const jwt = localStorage.getItem("token")
  if (jwt) {
      try {
          var base64Url = jwt.split('.')[1];
          var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          return JSON.parse(jsonPayload);
      }
      catch (e) {
          console.log(e)
      }
  }
  return ({ name: "visitor", role: "visitor" })
}

function createUser(){
    const { subscribe, set, update } = writable<user>(getUser())
    
    return {
        subscribe,
        set,
        update,
        login: async (user: string, password: string): Promise<boolean> => {
            const result = await request(`login/${user}/${password}`)
            if (result) {
                localStorage.setItem("token", result.jwt)
                set(result.user)
                return true
            }
            return false
        },
        logout: () => {
            localStorage.removeItem("token")
            set({role: "visitor", name: "visitor"})
        }
    }
}

export const currentUser = createUser()