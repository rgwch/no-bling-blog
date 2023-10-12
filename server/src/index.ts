import 'dotenv/config'
import { Documents } from "./documents.class"
import { Server } from './server'

const prefix = "/api/1.0/"
const docs = new Documents(process.env.documents, process.env.index)

const server=new Server(docs)
server.start()
