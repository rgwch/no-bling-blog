import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { getDatabase } from './db'

const prefix = "/api/1.0/"
const db = getDatabase()
db.use("nbb")
const app = new Hono()


// app.use("/static/", serveStatic({ path: "./" }))
app.use(prefix + "*", cors())
app.get(prefix + 'summary', async (c) => {

    const posts = await db.find({})
    posts.push("Ha")
    return c.json({ status: "ok", result: posts })
})

app.post(prefix + "add", async c => {
    const contents = await c.req.json()
    const result = await db.create(contents)
    c.status(201)
    return c.json({ status: "ok" })
})
console.log("Hono serving at port 3000")
serve(app)
