import { Hono} from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'


const app = new Hono()

app.use("/static/",serveStatic({path: "./"}))
app.get('/', (c) => c.text('Hello Hono!'))

export default app
