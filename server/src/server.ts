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
import { promisify } from 'node:util';
import { gzip, gunzip } from 'node:zlib';
import {
    createReadStream,
    createWriteStream,
} from 'node:fs';
const zip = promisify(gzip)
const unzip = promisify(gunzip)

const prefix = "/api/1.0/"


export class Server {
    private hono: Hono
    private bans: any = {}
    constructor(private docs: Documents) {
        this.hono = new Hono()
        let currentUser;
        if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "debug") {
            console.log("Running in development mode")
            this.hono.use(prefix + "*", cors())
        }
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
            return c.json({ status: "ok", result: posts })
        })

        /**
         * Retrieve one post by its _id
         */
        this.hono.get(prefix + "read/:id", async (c) => {
            const params = c.req.param()
            if (params["id"]) {
                const entry = await docs.get(params["id"], c.req.query("raw") == "true")
                return c.json({ status: "ok", result: entry })
            } else {
                throw new Error("no id supplied")
            }
        })
        /** zip a post for download */
        this.hono.get(prefix + "export/:id", async (c) => {
            const params = c.req.param()
            if (params["id"]) {
                const entry = await docs.get(params["id"], true)
                if (entry) {
                    const title = entry.heading.replace(/[^a-zA-Z0-9]/g, "_")
                    c.header("Content-Type", "application/octet-stream")
                    c.header("Content-Disposition", "attachment; filename=" + title + ".gz")
                    const zipped = await zip(JSON.stringify(entry))
                    return c.stream(async outp => {
                        await outp.write(zipped)
                    })
                } else {
                    throw new Error("no such entry")
                }
            } else {
                throw new Error("no id supplied")
            }
        })
        /**
         * Delete a post by its _id
         */
        this.hono.get(prefix + "delete/:id", async (c) => {
            const params = c.req.param()
            if (params["id"]) {
                const entries = await docs.find({ id: params["id"] })
                if (entries.length == 0) {
                    throw new Error("no such entry")
                }
                const entry = entries[0]
                if (hasAccess(entry)) {

                    const deleted = await docs.remove(params["id"])
                    return c.json({ status: "ok", result: entry })
                }
                else {
                    c.status(401)
                    return c.json({ status: "fail", message: "not authorized" })
                }
            } else {
                throw new Error("no id supplied")
            }
        })
        /**
         * log a user in
         */
        this.hono.get(prefix + "login/:user/:pwd", async (c) => {
            const cred: any = c.req.param()
            if (this.isBanned(cred.user)) {
                return c.json({ status: "fail", message: "banned" })
            }
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
                user.exp = Math.round(new Date().getTime() / 1000 + (parseInt(process.env.jwt_expiration || "3600")))
                if (!process.env.jwt_secret) {
                    logger.error("No JWT Secret found. ")
                }
                delete user.pass
                const token = await sign(user, process.env.jwt_secret)
                return c.json({ status: "ok", result: { jwt: token } })
            } else {
                logger.warn("Bad login attempt for user " + cred.user)
                this.ban(cred.user)
            }
            c.status(401)
            return c.json({ status: "fail", message: "bad credentials" })
        })
        /**
         * Extend the validity of a JWT
         */
        this.hono.get(prefix+"revalidate", async c => {
            if(currentUser){
                currentUser.exp = Math.round(new Date().getTime() / 1000 + (parseInt(process.env.jwt_expiration || "3600")))
                delete currentUser.pass
                const token = await sign(currentUser, process.env.jwt_secret)
                return c.json({ status: "ok", result: { jwt: token } })
            }
        })
        /**
         * Get some stats
         */
        this.hono.get(prefix + "stats", async (c) => {
            return c.json({
                status: "ok",
                result: {
                    startdate: docs.getFirstDate(),
                    categories: docs.getCategoryList(),
                    expiration: parseInt(process.env.jwt_expiration || "3600")
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
                return c.json({ status: "ok", result: stored })
            } else {
                c.status(401)
                return c.json({ status: "fail", message: "not authorized" })
            }
        })
        this.hono.post(prefix + "upload", async c => {
            if (currentUser.role == "admin" || currentUser.role == "editor") {
                try {
                    const body = await c.req.parseBody()
                    const h = await (body['file'] as File)
                    const result = await this.loadFile(h)
                    const unzipped = await unzip(result)
                    const parsed = JSON.parse(unzipped.toString())
                    delete parsed._id
                    await docs.add(parsed)
                    return c.json({ status: "ok" })
                } catch (err) {
                    logger.error(err)
                    return c.json({ status: "fail", message: err })
                }
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
                return c.json({ status: "ok" })
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
                return c.json({ status: "ok" })
            } else {
                c.status(401)
                return c.json({ "status": "fail", message: " not authorized" })
            }
        })
        this.hono.use("/*", async (c, next) => {
            const base = "../client/dist/"
            let filename = c.req.path
            if (filename == "/" || filename == "/index.html" || filename.startsWith("/post/") || filename.startsWith("/time/") || filename.startsWith("/cat/")) {
                filename = "index.html"
            }
            if (filename.includes("..")) {
                c.status(403)
                return c.json({ status: "fail", message: "forbidden" })
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
            } else if (filename.endsWith('png')) {
                mime = 'image/png'
            }
            c.header("Content-Type", mime)
            try {
                const cont = await fs.readFile(path.join(base, filename))
                return c.stream(async stream => {
                    await stream.write(cont)
                })
            } catch (err) {
                c.status(404)
                return c.json({ status: "fail", message: "not found: " + c.req.path })
            }

        })

    }
    loadFile(h: File): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const inp = h.stream()
            const n = h.name
            // const out = createWriteStream(outfile)
            const b = Buffer.alloc(h.size)
            const reader = inp.getReader()
            let bytes = 0
            return reader.read().then(function process({ done, value }) {
                if (done) {
                    console.log("done")
                    resolve(b)
                } else {
                    bytes += Buffer.from(value).copy(b, bytes, 0, value.length)
                    return reader.read().then(process)
                }
            })
        })
    }


    /**
     * check if a user is banned. If ban is expired, remove them from ban list
     * @param user username
     * @returns true if the user is banned
     */
    isBanned(user) {
        const banned = this.bans[user]
        if (banned?.exp) {
            if (banned.exp > Math.round(new Date().getTime() / 1000)) {
                return true
            } else {
                delete this.bans[user]
            }
        }
        return false
    }
    /**
     * Ban a user (after three bad login attempts, ban for 5 minutes)
     */
    ban(user) {
        const banned = this.bans[user]
        if (banned?.warned) {
            if (banned.warned > 1) {
                banned.exp = Math.round(new Date().getTime() / 1000 + 300)
            } else {
                banned.warned++
            }
        } else {
            this.bans[user] = { warned: 1 }
        }
    }
    public async start() {
        const port = parseInt(process.env.nbb_port || "3000")
        const result = await serve({ fetch: this.hono.fetch, port })
        logger.info("Hono serving at port " + port)

    }
}