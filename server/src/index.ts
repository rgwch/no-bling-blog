import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { getDatabase } from './db'
import { post } from "./types"
import { store } from './parser'

const prefix = "/api/1.0/"
const db = getDatabase()
db.use("nbb")
const app = new Hono()


// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
app.get(prefix + 'summary', async (c) => {
    const query: any = {}
    const cat = c.req.query('category')
    if (cat) {
        query.category = cat
    }
    const matcher = c.req.query('matching')
    if (matcher) {
        query.fulltext = matcher
    }
    const posts = await db.find(query)
    return c.json({ status: "ok", result: posts })
})

app.post(prefix + "add", async c => {
    const contents: post = await c.req.json()
    const document = contents.fulltext
    const stored = await store(contents)
    c.status(201)
    return c.json({ status: "ok", result: stored })
})
console.log("Hono serving at port 3000")
serve(app)
