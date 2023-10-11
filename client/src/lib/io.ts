import { currentJWT, currentUser } from "./store";
import type { user } from './types'
import env from './environment'
let jwt = ""
currentJWT.subscribe(n => {
    jwt = n
})

function setUser(user: user) {
    if (!user || user.name == "visitor") {
        currentUser.set({ name: "visitor", role: "visitor" })
        console.log("no role")
        // currentJWT.set("")
    } else {
        currentUser.set(user)
    }
}
export async function request(url: string, query: Array<string> = []): Promise<any> {
    // console.log(jwt)
    /*
    if (jwt?.length > 5) {
        query.push("jwt=" + jwt)
    }
    */
    const headers = new Headers()
    headers.append("accept", "application/json")
    if (jwt?.length > 5) {
        headers.append("Authorization", "Bearer " + jwt)
    }

    const answer = await fetch(env.url + url + "?" + query.join("&"), { headers })
    if (answer.ok) {
        if (answer.status == 401) {
            alert("unauthorized")
        }
        const result = await answer.json()
        if (result.status == "ok") {
            setUser(result.user)
            return result.result
        } else {
            alert(result.status + ": " + result.message)
        }
    }
    alert(answer.status + ", " + answer.statusText)
    if (answer.status == 401) {
        setUser({ role: "visitor", name: "visitor" })
    }
    return undefined
}

export async function write(url: string, body: any): Promise<any> {
    const headers: any = {
        "content-type": "application/json",
    }
    if (jwt?.length > 5) {
        headers["Authorization"] = "Bearer " + jwt
    }

    const options = {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    }
    const answer = await fetch(env.url + url, options)
    if (answer.ok) {
        const result = await answer.json()
        setUser(result.user)
        return result
    } else {
        alert(answer.status + ", " + answer.statusText)
        if (answer.status == 401) {
            setUser({ role: "visitor", name: "visitor" })
        }
        return undefined
    }

}

export async function login(user: string, password: string): Promise<boolean> {
    const result = await request(`login/${user}/${password}`)
    if (result) {
        currentJWT.set(result.jwt)
        currentUser.set(result.user)
        return true
    }
    return false
}