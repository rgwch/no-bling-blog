/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

/**
 * Launcher stup for "npm run dev" and "npm run prod"
 */
import 'dotenv/config'
import { Documents } from "./documents.class"
import { Server } from './server'

const docs = new Documents(process.env.documents)
docs.initialize().then(() => {
    const server = new Server(docs)
    server.start()
})
