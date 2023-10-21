import { writable } from "svelte/store"
import jwtDecode from 'jwt-decode'
import { request } from './io'

type subscriber = (val: any) => void
type unsubscriber = (func: subscriber) => void
export type userType = {
    name: string
    role: string
    label?: string
    exp: number
}

const nobody: userType = { name: "visitor", role: "visitor", exp: 0 }
export class User {
    private subscriptions: Set<subscriber> = new Set()
    private act: userType = nobody

    private exp: number = 3600
    constructor() {
        const jwt = localStorage.getItem("token")
        if (jwt) {

            try {
                const decoded: userType = jwtDecode(jwt)
                // console.log(JSON.stringify(decoded))
                const now = new Date().getTime() / 1000
                if (now + this.exp < decoded.exp || decoded.exp == 0) {
                    this.set(decoded)
                } else {
                    this.set(nobody)
                }
            }
            catch (e) {
                console.log(e)
                this.set(nobody)
            }
        } else {
            this.set(nobody)
        }
    }
    public setExpirationTime(time: number) {
        this.exp = time
    }
    public isLoggedIn(): boolean {
        if (this.act.role == "visitor") {
            return false
        }
        const now = new Date().getTime() / 1000
        if (now + this.exp < this.act.exp || this.act.exp == 0) {
            this.set(nobody)
            return false
        }
        return true
    }

    public subscribe(func: subscriber): unsubscriber {
        this.subscriptions.add(func)
        func(this.act)
        return () => this.subscriptions.delete(func)
    }

    public async login(user: string, password: string): Promise<boolean> {
        const result = await request(`login/${user}/${password}`)
        if (result) {
            const token = result.jwt
            localStorage.setItem("token", token)
            const decoded: userType = jwtDecode(token)
            console.log(JSON.stringify(decoded))
            this.set(decoded)
            return true
        }
        return false
    }
    async logout() {
        localStorage.removeItem("token")
        this.set(nobody)
    }
    public set(val: userType) {
        this.act = val
        for (const func of this.subscriptions) {
            func(val)
        }
    }

}

export const currentUser = new User()