import { writable } from "svelte/store"
import jwtDecode from 'jwt-decode'
import { request } from './io'

type subscriber = (val: any) => void
type unsubscriber = (func: subscriber) => void
type user = {
    name: string
    role: string
    label?: string
    exp: number
}

const nobody: user = { name: "visitor", role: "visitor", exp: 0 }
export class User {
    private internal = writable<user>(nobody)
    private exp: number = 3600
    constructor() {
        const jwt = localStorage.getItem("token")
        if (jwt) {

            try {
                const decoded: user = jwtDecode(jwt)
                console.log(JSON.stringify(decoded))
                const now = new Date().getTime() / 1000
                if (now + this.exp > decoded.exp || decoded.exp == 0) {
                    this.internal.set(decoded)
                }
            }
            catch (e) {
                console.log(e)
                this.internal.set(nobody)
            }
        } else {
            this.internal.set(nobody)
        }
    }
    public setExpirationTime(time: number) {
        this.exp = time
    }
    public subscribe(func: subscriber): unsubscriber {
        return this.internal.subscribe(func)
    }

    public async login(user: string, password: string): Promise<boolean> {
        const result = await request(`login/${user}/${password}`)
        if (result) {
            localStorage.setItem("token", result.jwt)
            this.set(result.user)
            return true
        }
        return false
    }
    async logout() {
        localStorage.removeItem("token")
        this.set({ role: "visitor", name: "visitor", exp: 0 })
    }
    public set(val: user) {
        return this.internal.set(val)
    }

}

export const currentUser = new User()