import type { user } from './types'
import { expiration } from './store'

import env from './environment'

export let api: string = env.prefix
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    api = `http://localhost:${env.port}${env.prefix}`
}

let exp = 3600
expiration.subscribe((value) => {
    exp = value
})



export function addJWT(headers?: Headers) {
    if (!headers) {
        headers = new Headers()
    }
    const jwt = localStorage.getItem("token")

    if (jwt) {
        headers.append("Authorization", "Bearer " + jwt)
    }
    return headers;
}
/**
 * Send a GET request to the server. Will enclose the user's JWT if available.
 * @param url url within the api (after the prefix)
 * @param query any parameters to be sent
 * @returns 
 */
export async function request(url: string, query: Array<string> = []): Promise<any> {
    const headers = addJWT()
    headers.append("accept", "application/json")

    const answer = await fetch(api + url + "?" + query.join("&"), { headers })
    if (answer.ok) {
        const result = await answer.json()
        if (result.status == "ok") {
            // setUser(result.user)
            return result.result
        } else {
            alert(result.status + ": " + result.message)
            // setUser({ role: "visitor", name: "visitor" })
            return result.message
        }
    }
    alert(answer.status + ", " + answer.statusText)
    if (answer.status == 401) {
        // setUser({ role: "visitor", name: "visitor" })
    }
    return undefined
}

/**
 * Send a POST request to the server. Will enclose the user's JWT if available.
 * @param url url within the api (after the prefix)
 * @param body post body
 * @returns 
 */
export async function write(url: string, body: any): Promise<any> {
    const headers = addJWT()
    headers.append("content-type", "application/json")

    const options = {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    }
    const answer = await fetch(api + url, options)
    if (answer.ok) {
        const result = await answer.json()
        // setUser(result.user)
        return result
    } else {
        alert(answer.status + ", " + answer.statusText)
        if (answer.status == 401) {
            // setUser({ role: "visitor", name: "visitor" })
        }
        return undefined
    }

}

/**
 * Send a Login request to the server. Will set the user and JWT if successful.
 * @param user 
 * @param password 
 * @returns 
 
export async function login(user: string, password: string): Promise<boolean> {
    const result = await request(`login/${user}/${password}`)
    if (result) {
        localStorage.setItem("token", result.jwt)
        // currentUser.set(result.user)
        return true
    }
    return false
}

export function logout(){
    localStorage.removeItem("token")
    // setUser({role: "visitor", name: "visitor"})
}
*/