/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

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
/**
 * This class represents the current user. It is a singleton. 
 */
export class User {
    private subscriptions: Set<subscriber> = new Set()
    private actUser: userType = nobody
    private timer: any

    /**
     *  Constructor. Will try to read the JWT from local storage and set the user accordingly.
     */
    constructor() {
        const jwt = localStorage.getItem("token")
        if (jwt) {

            try {
                const decoded: userType = jwtDecode(jwt)
                const now = new Date().getTime() / 1000
                if (now <= decoded.exp || decoded.exp == 0) {
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
    /**
     * Returns true if the user is logged in and the JWT is valid.
     * @returns 
     */
    public isLoggedIn(): boolean {
        if (this.actUser.role == "visitor") {
            return false
        }
        const now = new Date().getTime() / 1000
        if (now > this.actUser.exp || this.actUser.exp == 0) {
            this.set(nobody)
            return false
        }
        return true
    }
    /**
     * Implemention of the publisher/subscriber pattern for zhe Svelte store
     * @param func the subscriber 
     * @returns an unsubscriber function
     */
    public subscribe(func: subscriber): unsubscriber {
        this.subscriptions.add(func)
        func(this.actUser)
        return () => this.subscriptions.delete(func)
    }

    /**
     * Send a Login request to the server. Will set the user and JWT if successful.
     * @param user 
     * @param password 
     * @returns true if the login was successful
     */
    public async login(user: string, password: string): Promise<boolean> {
        const result = await request(`login/${user}/${password}`)
        if (result) {
            const token = result.jwt
            localStorage.setItem("token", token)
            const decoded: userType = jwtDecode(token)
            // console.log(JSON.stringify(decoded))
            this.set(decoded)
            return true
        }
        return false
    }
    /**
     * Logout the user. Will remove the JWT from local storage and set the user to nobody.
     */
    async logout() {
        localStorage.removeItem("token")
        this.set(nobody)
    }
    /**
     * Set Method from the Svelte Store
     * @param val 
     */
    public set(val: userType) {
        this.actUser = val
        if (this.timer) {
            clearTimeout(this.timer)
        }
        if (this.actUser.exp != 0) {
            this.timer = setTimeout(() => this.set(nobody), (this.actUser.exp - new Date().getTime() / 1000) * 1000)
        }
        for (const func of this.subscriptions) {
            func(val)
        }
    }

}

export const currentUser = new User()