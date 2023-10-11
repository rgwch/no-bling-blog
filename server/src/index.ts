import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { decode, sign, verify } from 'hono/jwt'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { getDatabase } from './database/db'
import { post } from './types'
import { Documents } from "./documents.class"
import { createHash } from 'node:crypto'
import fs from 'fs/promises'

const prefix = "/api/1.0/"
const app = new Hono()
const docs = new Documents(process.env.documents, process.env.index)
let currentUser;
// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
app.use(prefix + "*", async (c, next) => {
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
            console.log(err)
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
app.get(prefix + 'summary', async (c) => {
    let posts = await docs.find(c.req.param())
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
app.get(prefix + "read/:id", async (c) => {
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
app.get(prefix + "login/:user/:pwd", async (c) => {
    const cred: any = c.req.param()
    const hash = createHash('sha256')
    hash.update(cred.pwd)
    const hashed = hash.digest().toString("base64")
    const usersfile = await fs.readFile(process.env.users, "utf-8")
    const users = JSON.parse(usersfile)
    const user = users.find(u => u.name == cred.user)
    if (user?.pass === hashed) {
        // login ok
        user.exp = Math.round(new Date().getTime() / 1000 + 3600)
        if (!process.env.jwt_secret) {
            console.log("No JWT Secret found. ")
        }
        delete user.pass
        const token = await sign(user, process.env.jwt_secret)
        delete user.pass
        return c.json({ status: "ok", result: { jwt: token, user } })
    }
    c.status(401)
    return c.json({ status: "fail", message: "bad credentials" })
})

app.get(prefix + "stats", async (c) => {
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
app.post(prefix + "add", async c => {
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
app.post(prefix + "update", async c => {

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
app.post(prefix + "updatemeta", async c => {
    const contents: post = await c.req.json()
    if (hasAccess(contents)) {
        await docs.updateMeta(contents)
        return c.json({ status: "ok", user: currentUser })
    } else {
        c.status(401)
        return c.json({ "status": "fail", message: " not authorized" })
    }
})

console.log("Hono serving at port 3000")

if (process.env.runner != 'bun') {
    serve(app)
}
export default app
