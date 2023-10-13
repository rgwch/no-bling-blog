/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import { Hono } from 'hono'
import { post } from './types'
import { cors } from 'hono/cors'
import { Documents } from './documents.class'
import { decode, sign, verify } from 'hono/jwt'
import fs from 'fs/promises'
import path from 'path'
import { logger } from './logger'
import { createHash } from 'node:crypto'
import { serve } from '@hono/node-server'


const prefix = "/api/1.0/"


export class Server {
    private hono: Hono
    constructor(private docs: Documents) {
        this.hono = new Hono()
        let currentUser;
        this.hono.use(prefix + "*", cors())
        this.hono.use(prefix + "*", async (c, next) => {
            currentUser = { name: "visitor", role: "visitor" }
            let jwt
            const bearer = c.req.header("Authorization")
            if (bearer?.startsWith("Bearer ")) {
                jwt = bearer.substring(7)
            }
            if (jwt) {
                try {
                    const user = await verify(jwt, process.env.jwt_secret)
                    if (user) {
                        currentUser = user
                    }
                }
                catch (err) {
                    logger.error(err)
                }
            }
            await next()
        })
        function hasAccess(post: post): boolean {
            if (currentUser.role == "admin") {
                return true
            }
            if (currentUser.role == "editor") {
                if (post.author == currentUser.name) {
                    return true
                }
            }
            return false;
        }
        /**
         * Find all posts matching given criteria 
         */
        this.hono.get(prefix + 'summary', async (c) => {
            let posts = await docs.find(c.req.query())
            posts = posts.filter(post => {
                if (hasAccess(post)) {
                    return true
                }
                return post.published;
            })
            return c.json({ status: "ok", user: currentUser, result: posts })
        })

        /**
         * Retrieve one post by its _id
         */
        this.hono.get(prefix + "read/:id", async (c) => {
            const params = c.req.param()
            if (params["id"]) {
                const entry = await docs.get(params["id"], c.req.query("raw") == "true")
                return c.json({ status: "ok", user: currentUser, result: entry })
            } else {
                throw new Error("no id supplied")
            }
        })
        /**
         * log a user in
         */
        this.hono.get(prefix + "login/:user/:pwd", async (c) => {
            const cred: any = c.req.param()
            const hash = createHash('sha256')
            hash.update(cred.pwd)
            const hashed = hash.digest().toString("base64")
            const usersfile = await fs.readFile(process.env.users, "utf-8")
            const users = JSON.parse(usersfile)
            const user = users.find(u => u.name == cred.user)
            if (user) {
                if (!user.pass) {     // fist time login of a new user
                    user.pass = hashed
                    await fs.writeFile(process.env.users, JSON.stringify(users))
                }
            }
            if (user?.pass === hashed) {
                // login ok
                user.exp = Math.round(new Date().getTime() / 1000 + 3600)
                if (!process.env.jwt_secret) {
                    logger.error("No JWT Secret found. ")
                }
                delete user.pass
                const token = await sign(user, process.env.jwt_secret)
                delete user.pass
                return c.json({ status: "ok", result: { jwt: token, user } })
            }
            c.status(401)
            return c.json({ status: "fail", message: "bad credentials" })
        })

        this.hono.get(prefix + "stats", async (c) => {
            return c.json({
                status: "ok",
                result: {
                    startdate: docs.getFirstDate(),
                    categories: docs.getCategoryList()
                }
            })
        })
        /**
         * Add a new Post
         */
        this.hono.post(prefix + "add", async c => {
            if (currentUser.role == "admin" || currentUser.role == "editor") {
                const contents: post = await c.req.json()
                if (!contents.author) {
                    contents.author = currentUser.name
                }
                const stored = await docs.add(contents)
                c.status(201)
                return c.json({ status: "ok", user: currentUser, result: stored })
            } else {
                c.status(401)
                return c.json({ status: "fail", message: "not authorized" })
            }
        })

        /**
         * Update post
         */
        this.hono.post(prefix + "update", async c => {

            const contents: post = await c.req.json()
            if (hasAccess(contents)) {
                await docs.update(contents)
                return c.json({ status: "ok", user: currentUser })
            } else {
                c.status(401)
                return c.json({ "status": "fail", message: " not authorized" })
            }
        })

        /**
         * update only metadata of a post
         */
        this.hono.post(prefix + "updatemeta", async c => {
            const contents: post = await c.req.json()
            if (hasAccess(contents)) {
                await docs.updateMeta(contents)
                return c.json({ status: "ok", user: currentUser })
            } else {
                c.status(401)
                return c.json({ "status": "fail", message: " not authorized" })
            }
        })
        this.hono.use("/*", async (c, next) => {
            const base = "../client/dist/"
            let filename = c.req.path
            if (filename == "/") {
                filename = "index.html"
            }
            logger.debug("serving " + filename)
            let mime = 'text/html; charset="utf-8"'
            if (filename.endsWith('js')) {
                mime = 'text/javascript'
            } else if (filename.endsWith('css')) {
                mime = 'text/css'
            } else if (filename.endsWith('svg')) {
                mime = 'text/svg+xml'
            } else if (filename.endsWith('jpg')) {
                mime = 'image/jpeg'
            } else if (filename.endsWith('txt')) {
                mime = 'text/plain'
            }
            c.header("Content-Type", mime)
            try {
                const cont = await fs.readFile(path.join(base, filename))
                return c.stream(async stream => {
                    await stream.write(cont)
                })
            } catch (err) {
                c.status(404)
                return c.json({ status: "fail", message: "not found" })
            }

        })


        logger.info("Hono serving at port 3000")

    }
    public async start() {
        const result = await serve({ fetch: this.hono.fetch, port: 3000 })
        // console.log(result.port))
    }
}