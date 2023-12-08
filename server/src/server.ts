/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import { Hono } from 'hono'
import { Blogpost } from './types'
import { cors } from 'hono/cors'
import { Documents } from './documents.class'
import { sign, verify } from 'hono/jwt'
import fs from 'fs/promises'
import path from 'path'
import { logger } from './logger'
import { createHash } from 'node:crypto'
import { serve } from '@hono/node-server'
import { promisify } from 'node:util';
import { gzip, gunzip } from 'node:zlib';
import { existsSync } from 'node:fs';
const pck = require('../package.json')
const cpck = require('../../client/package.json')
const zip = promisify(gzip)
const unzip = promisify(gunzip)

const prefix = "/api/1.0/"

/**
 * Create and configure the web-server.
 */
export class Server {
    private hono: Hono
    private bans: any = {}
    constructor(docs: Documents) {
        this.hono = new Hono()
        let currentUser;
        /*
            Allow CORS in development mode (so we can access localhost:3000 from localhost:5173)
        */
        if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "debug") {
            logger.info("Running in development mode")
            this.hono.use(prefix + "*", cors())
        }
        /*
            Check auth Header and set currentUser for every request
        */
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
        this.hono.use(prefix + "admin/*", async (c, next) => {
            if (currentUser.role == "admin") {
                await next()
            } else {
                c.status(401)
                return c.json({ status: "fail", message: "not authorized" })
            }
        })
        /**
         * Check access for current user to a given post
         * @param post post to check
         * @returns true if currentUSser has write access to the post
         */
        function hasAccess(post: Blogpost): boolean {
            if (currentUser.role == "admin") {
                return true
            }
            if (currentUser.role == "editor") {
                if (post.author == currentUser.name) {
                    return true
                }
                if (post.author == currentUser.label) {
                    return true
                }
            }
            return false;
        }


        /**
         * Get the version of the server
         */
        this.hono.get(prefix + "version", async c => {
            return c.json({ status: "ok", result: "Version Server:" + pck.version + "; client:" + cpck.version })
        })

        /**
         * Get the list of users (must be admin)
         */
        this.hono.get(prefix + "admin/users", async c => {
            const usersfile = await fs.readFile(process.env.users, "utf-8")
            const users = JSON.parse(usersfile)
            return c.json({ status: "ok", result: users })
        })

        /**
         * add a user to the users.json file (must be admin)
         */
        this.hono.get(prefix + "admin/adduser/:name/:role/:label?", async c => {
            const params: any = c.req.param()
            const usersfile = await fs.readFile(process.env.users, "utf-8")
            const users = JSON.parse(usersfile)
            const user = users.find(u => u.name == params.name)
            if (user) {
                return c.json({ status: "fail", message: "user already exists" })
            }
            users.push({ name: params.name, label: params.label || params.name, role: params.role })
            await fs.writeFile(process.env.users, JSON.stringify(users))
            return c.json({ status: "ok" })

        })
        /**
         * delete a user from the users.json file (must be admin)
         */
        this.hono.get(prefix + "admin/deluser/:name", async c => {
            const params: any = c.req.param()
            const usersfile = await fs.readFile(process.env.users, "utf-8")
            const users = JSON.parse(usersfile)
            const user = users.find(u => u.name == params.name)
            if (!user) {
                return c.json({ status: "fail", message: "user not found" })
            }
            const index = users.indexOf(user)
            users.splice(index, 1)
            await fs.writeFile(process.env.users, JSON.stringify(users))
            return c.json({ status: "ok" })

        })
        /**
         * modify a user in the users.json file (must be admin)
         */
        this.hono.get(prefix + "admin/moduser/:name/:role/:label?", async c => {
            const params: any = c.req.param()
            const usersfile = await fs.readFile(process.env.users, "utf-8")
            const users = JSON.parse(usersfile)
            const user = users.find(u => u.name == params.name)
            if (!user) {
                return c.json({ status: "fail", message: "user not found" })
            }
            user.role = params.role
            user.label = params.label || params.name
            await fs.writeFile(process.env.users, JSON.stringify(users))
            return c.json({ status: "ok" })
        })
        /**
         * Find all posts matching given criteria 
         */
        this.hono.get(prefix + 'summary', async (c) => {
            let posts:Array<Blogpost> = await docs.find(c.req.query())
            posts = posts.filter(post => {
                if (hasAccess(post)) {
                    return true
                }
                return post.published;
            })
            return c.json({ status: "ok", result: posts })
        })

        this.hono.get(prefix + "ping", c => {
            return c.json({ status: "ok" })
        })
        /**
         * Get Metadata of one post by its _id
         */
        this.hono.get(prefix + "meta/:id", async c => {
            const params = c.req.param()
            if (params["id"]) {
                const entry = await docs.getMeta(params["id"])
                if (entry) {
                    return c.json({ status: "ok", result: entry })
                } else {
                    throw new Error("no such entry")
                }
            } else {
                throw new Error("no id supplied")
            }

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
        /** gzip a post for download */
        this.hono.get(prefix + "export/:id", async (c) => {
            const params = c.req.param()
            if (params["id"]) {
                const entry = await docs.get(params["id"], true)
                if (entry) {
                    const title = entry.heading.replace(/[^a-zA-Z0-9]/g, "_")
                    c.header("Content-Type", "application/octet-stream")
                    c.header("Content-Disposition", "attachment; filename=" + title + ".nbb")
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
         * log a user in. If username and password match an entry in users.json, return a JWT. 
         * This JWT is used as a bearer token for all subsequent requests.
         */
        this.hono.get(prefix + "login/:user/:pwd", async (c) => {
            const cred: any = c.req.param()
            if (this.isBanned(cred.user)) {
                return c.json({ status: "fail", message: "banned" })
            }
            const hash = createHash('sha256')
            hash.update(cred.pwd)
            const hashed = hash.digest().toString("base64")
            let users = []
            // create users.json with default admin if it does not exist
            if (existsSync(process.env.users) == false) {
                users.push({ name: "admin", role: "admin", label: "Administrator" })
                await fs.writeFile(process.env.users, JSON.stringify(users))
            } else {
                const usersfile = await fs.readFile(process.env.users, "utf-8")
                users = JSON.parse(usersfile)
            }
            const user = users.find(u => u.name == cred.user)
            if (user) {
                if (!user.pass) {     // first time login of a new user
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
         * Return a new JWT with extended expiration date
         */
        this.hono.get(prefix + "revalidate", async c => {
            if (currentUser) {
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
                const contents: Blogpost = await c.req.json()
                if (!contents.author) {
                    contents.author = currentUser.label ?? currentUser.name
                }
                const stored:Blogpost = await docs.add(contents)
                c.status(201)
                return c.json({ status: "ok", result:  stored})
            } else {
                c.status(401)
                return c.json({ status: "fail", message: "not authorized" })
            }
        })
        /**
         * Upload a gzipped post or a file. If it's a post, it will be unzipped and entered as new Post. 
         * If it's a file, it will be stored in the uploads folder.
         */
        this.hono.post(prefix + "upload", async c => {
            if (currentUser.role == "admin" || currentUser.role == "editor") {
                try {
                    const body = await c.req.parseBody()
                    const h = await (body['file'] as File)
                    const result = await this.loadFile(h)
                    if (h.name.endsWith(".nbb")) {
                        const unzipped = await unzip(result)
                        const parsed = JSON.parse(unzipped.toString())
                        // delete parsed._id
                        parsed.author = currentUser.label ?? currentUser.name
                        await docs.add(parsed)
                    } else {
                        await fs.mkdir(process.env.uploads, { recursive: true })
                        await fs.writeFile(path.join(process.env.uploads, h.name), result)
                    }
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

            const contents: Blogpost = await c.req.json()
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
            const contents: Blogpost = await c.req.json()
            if (hasAccess(contents)) {
                await docs.updateMeta(contents)
                return c.json({ status: "ok" })
            } else {
                c.status(401)
                return c.json({ "status": "fail", message: " not authorized" })
            }
        })
        /**
         * Serve static files from client/dist.
         * Since NoBlingBlog is a WebApp, most requests are handled by the client. We handle here the very first call (which must serve the App itself),
         * and subsequent calls which load resources (js, css, images) from the client/dist folder.
         * Some special calls (to /post/*, /time/*, /cat/*) are directed to the client (by serving index.html again)
         */
        this.hono.use("/*", async (c, next) => {
            const base = "../client/dist/"
            let filename = c.req.path
            if (filename == "/" || filename == "/index.html" ||
                filename.startsWith("/post/") ||
                filename.startsWith("/time/") ||
                filename.startsWith("/cat/")) {
                filename = "index.html"
            }
            // Do not allow calls outside the client/dist folder
            if (filename.includes("..")) {
                c.status(403)
                return c.json({ status: "fail", message: "forbidden" })
            }
            logger.debug("serving " + filename)
            let mime = 'text/html; charset="utf-8"'
            const ext = path.extname(filename)
            switch (ext) {
                case ('.js'): mime = 'text/javascript'; break;
                case ('.css'): mime = 'text/css'; break;
                case ('.svg'): mime = 'text/svg+xml'; break;
                case ('.jpg'): mime = 'image/jpeg'; break;
                case ('.txt'): mime = 'text/plain'; break;
                case ('.png'): mime = 'image/png'; break;
                case ('.ico'): mime = 'image/x-icon'; break;
            }
            c.header("Content-Type", mime)
            /* Serve file from client/dist. If not found there, try uploads folder. */
            try {
                const file = existsSync(path.join(base, filename)) ? path.join(base, filename) : path.join(process.env.uploads, filename)
                const cont = await fs.readFile(file)
                return c.stream(async stream => {
                    await stream.write(cont)
                })
            } catch (err) {
                c.status(404)
                return c.json({ status: "fail", message: "not found: " + c.req.path })
            }

        })

    } // end of constructor

    /**
     * Load a file from a File object
     * @param h File object
     * @returns a Buffer with the file content
     */
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
                    logger.debug("done")
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
    /**
     * Start the server
     */
    public async start() {
        const port = parseInt(process.env.nbb_port || "3000")
        const result = await serve({ fetch: this.hono.fetch, port })
        logger.warn("Hono serving at port " + port)

    }
}