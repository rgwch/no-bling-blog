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
const db = getDatabase()
db.use("nbb")
const app = new Hono()
const docs = new Documents(process.env.documents, process.env.index)
const tokens: Array<string> = []
// console.log(process.env)

// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
/**
 * Find all posts matching given criteria 
 */
app.get(prefix + 'summary', async (c) => {
    const query: any = {}
    const jwt = c.req.query("jwt")
    let role = "visitor"
    if (jwt) {
        const user = verify(jwt, process.env.jwt_secret)
        if (user) {
            role = user["role"]
        }
    }
    const cat = c.req.query('category')
    if (cat) {
        query.category = cat
    }
    const sum = c.req.query('summary')
    if (sum) {
        query.teaser = sum
    }
    let posts: Array<post> = await db.find(query)
    const matcher = c.req.query('fulltext')
    if (matcher) {
        posts = await docs.filter(posts, matcher)
    }

    return c.json({ status: "ok", role, result: posts })
})

/**
 * Retrieve one post by its _id
 */
app.get(prefix + "read/:id", async (c) => {
    const params = c.req.param()
    if (params["id"]) {
        const entry = await db.get(params["id"])
        const processed = await docs.loadContents(entry)
        return c.json({ status: "ok", result: processed })
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
    const user = users[cred.user]
    if (user?.pass === hashed) {
        // login ok
        user.exp = Math.round(new Date().getTime() / 1000 + 60)
        const token = await sign(user, process.env.jwt_secret)
        tokens.push(token)
        return c.json({ status: "ok", result: { jwt: token, role: user.role } })
    }
    return c.json({ status: "fail", message: "bad credentials" })
})
/**
 * Add a new Post
 */
app.post(prefix + "add", async c => {
    const contents: post = await c.req.json()
    const document = contents.fulltext
    if (!contents._id) {
        contents._id = uuid()
    }
    delete contents.fulltext
    const stored = await docs.addToIndex(contents._id, document, contents.heading)
    contents.filename = stored.filename
    await db.create(contents)
    c.status(201)
    return c.json({ status: "ok", result: stored })
})

app.post(prefix + "updatemeta", async c => {
    const contents: post = await c.req.json()
    contents.modified = new Date()
    delete contents.fulltext
    const result = await db.update(contents._id, contents)
    return c.json({ status: "ok", result })
})

console.log("Hono serving at port 3000")

if (process.env.runner != 'bun') {
    serve(app)
}
export default app
