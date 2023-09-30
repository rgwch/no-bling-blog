import { currentJWT, currentRole } from "./store";
import env from './environment'
let jwt = ""
currentJWT.subscribe(n => {
    jwt = n
})

export async function request(url: string, query: Array<string> = []): Promise<any> {
    query.push("jwt=" + jwt)
    const answer = await fetch(env.url + url + "?" + query.join("&"))
    if (answer.ok) {
        const result = await answer.json()
        if (result.status == "ok") {
            return result.result
        } else {
            alert(result.status + ": " + result.message)
        }
    }
    return undefined
}

export async function login(user: string, password: string) {
    const result = await request(`login/${user}/${password}`)
    if (result) {
        currentJWT.set(result.jwt)
        currentRole.set(result.role)
    }
}