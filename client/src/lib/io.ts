/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import { currentUser } from "./user"
const prefix = "/api/1.0/"
let port = 3000

export let api: string = prefix
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    api = `http://localhost:${port}${prefix}`
}

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

export async function requestRaw(url: string): Promise<any> {
    const headers = addJWT()
    const answer = await fetch(api + url, { headers })
    if (answer.ok) {
        return await answer.blob()
    }
    alert(answer.status + ", " + answer.statusText)
    if (answer.status == 401) {
        currentUser.logout()
    }
    return undefined
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
            currentUser.logout()
            return result.message
        }
    }
    alert(answer.status + ", " + answer.statusText)
    if (answer.status == 401) {
        currentUser.logout()
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
            currentUser.logout()
        }
        return undefined
    }

}

