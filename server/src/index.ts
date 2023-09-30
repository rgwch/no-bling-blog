import 'dotenv/config'
import { Hono } from 'hono'
// import { serve } from '@hono/node-server'
// import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { getDatabase } from './db'
import { post } from './types'
import { Documents } from "./documents.class"
import { v4 as uuid } from 'uuid'

const prefix = "/api/1.0/"
const db = getDatabase()
db.use("nbb")
const app = new Hono()
const docs = new Documents(process.env.documents, process.env.index)


// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
app.get(prefix + 'summary', async (c) => {
    const query: any = {}
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

    return c.json({ status: "ok", result: posts })
})

app.get(prefix + "read/:id", async (c) => {
    const params = c.req.param()
    if (params["id"]) {
        const entry = await db.get(params["id"])
        const processed = docs.loadContents(entry)
        return c.json({ status: "ok", result: processed})
    } else {
        throw new Error("no id supplied")
    }
})
app.post(prefix + "add", async c => {
    const contents: post = await c.req.json()
    const document = contents.fulltext
    if (!contents._id) {
        contents._id = uuid()
    }
    const stored = await docs.addToIndex(contents._id, document, contents.heading)
    contents.fulltext = stored.filename
    await db.create(contents)
    c.status(201)
    return c.json({ status: "ok", result: stored })
})
console.log("Hono serving at port 3000")

// serve(app)
export default app