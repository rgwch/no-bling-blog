import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { decode, sign, verify } from 'hono/jwt'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { getDatabase } from './db'
import { post } from './types'
import { Documents } from "./documents.class"
import { v4 as uuid } from 'uuid'
import { createHash } from 'node:crypto'
import fs from 'fs/promises'

const prefix = "/api/1.0/"
const categories = new Set<string>()
let dateFrom = new Date()
const db = getDatabase()
db.use("nbb")
const app = new Hono()
const docs = new Documents(process.env.documents, process.env.index)
db.find({}).then((posts: Array<post>) => {
    for (const p of posts) {
        categories.add(p.category)
        const d: Date = new Date(p.created)
        if (d.getTime() < dateFrom.getTime()) {
            dateFrom = d
        }
    }
})
/*
const cats = posts.map((post) => {
    return post.category;
});
categories = ["", ...new Set(cats)];
*/

// console.log(process.env)
let currentUser;
// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
app.use(prefix + "*", async (c, next) => {
    let jwt = c.req.query("jwt")
    currentUser = { name: "visitor", role: "visitor" }
    if (!jwt) {
        const bearer = c.req.header("Authorization")
        if (bearer?.startsWith("Bearer ")) {
            jwt = bearer.substring(7)
        }
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
    const query: any = {}

    const cat = c.req.query('category')
    if (cat) {
        query.category = cat
    }
    const sum = c.req.query('summary')
    if (sum) {
        query.teaser = new RegExp(sum)
    }
    const from = c.req.query("from")
    if (from) {
        query.created = { $gte: new Date(from + "-01-01") }
    }
    const until = c.req.query("until")
    if (until) {
        query.created = { $lte: new Date(until + "-12-31") }
    }
    const between = c.req.query("between")
    if (between) {
        const cr = between.split(/[,\-]/)
        query.$and = [{ created: { $gte: new Date(cr[0] + "-01-01") } }, { created: { $lte: new Date(cr[1] + "-12-31") } }]
    }
    let posts: Array<post> = await db.find(query)
    const matcher = c.req.query('fulltext')
    if (matcher) {
        posts = await docs.filter(posts, matcher)
    }
    posts = posts.filter(post => {
        if (hasAccess(post)) {
            return true
        }
        return post.published;
    })
    return c.json({ status: "ok", role: currentUser?.role, result: posts })
})

/**
 * Retrieve one post by its _id
 */
app.get(prefix + "read/:id", async (c) => {
    const params = c.req.param()
    if (params["id"]) {
        const entry = await db.get(params["id"])
        const processed = await docs.loadContents(entry, c.req.query("raw") == "true")
        return c.json({ status: "ok", role: currentUser?.role, result: processed })
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
        const token = await sign(user, process.env.jwt_secret)
        return c.json({ status: "ok", result: { jwt: token, role: user.role } })
    }
    c.status(401)
    return c.json({ status: "fail", message: "bad credentials" })
})

app.get(prefix + "stats", async (c) => {
    return c.json({
        status: "ok",
        result: {
            startdate: dateFrom,
            categories:[...categories]
        }
    })
})
/**
 * Add a new Post
 */
app.post(prefix + "add", async c => {
    if (currentUser.role == "admin" || currentUser.role == "editor") {
        const contents: post = await c.req.json()
        const document = contents.fulltext
        if (!contents._id) {
            contents._id = uuid()
        }
        delete contents.fulltext
        const stored = await docs.addToIndex(contents._id, document, contents.heading)
        contents.filename = stored.filename
        contents.author = currentUser.name
        contents.created = new Date()
        contents.modified = new Date()
        await db.create(contents)
        categories.add(contents.category)
        c.status(201)
        return c.json({ status: "ok", role: currentUser.role, result: stored })
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
        const document = contents.fulltext
        delete contents.fulltext
        contents.modified = new Date()
        await db.update(contents._id, contents)
        const stored = await docs.replaceDocument(contents._id, document, contents.heading)
        categories.add(contents.category)
        return c.json({ status: "ok", role: currentUser.role, stored })
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
        contents.modified = new Date()
        delete contents.fulltext
        const result = await db.update(contents._id, contents)
        return c.json({ status: "ok", role: currentUser.role, result })
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
