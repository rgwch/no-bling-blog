/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import fs from 'fs/promises'
import path from 'path'
import { Blogpost } from './types'
import { MetaScraper } from './scrapers'
import { tokenizer } from './tokenizer'
import { NeDB } from './database/nedb.class'
import { logger } from './logger'
import { processContents } from './process_md'
const docdb = "nbbdocs"
const indexdb = "nbbindex"

/**
 * This class manages the database of documents. It uses the NeDB class to store the documents and the index.
 */

/**
 * Check environment variables and set defaults
 */
if (!process.env.jwt_secret) {
    console.log("No JWT secret set. Please set the environment variable jwt_secret")
    process.exit(1)
}
if (!process.env.storage) {
    process.env.storage = "nedb"
}
if (!process.env.basedir) {
    process.env.basedir = "../data"
}
if (!process.env.documents) {
    process.env.documents = path.join(process.env.basedir, "documents")
}
if (!process.env.backupdir) {
    process.env.backupdir = path.join(process.env.basedir, "backup")
}
if (!process.env.nedb_datadir) {
    process.env.nedb_datadir = process.env.documents
}
if (!process.env.partials) {
    process.env.partials = path.join(process.env.basedir, "partials")
}
if (!process.env.users) {
    process.env.users = path.join(process.env.basedir, "users.json")
}
if (!process.env.uploads) {
    process.env.uploads = path.join(process.env.basedir, "uploads")
}
export type analyzed = {
    filename: string
    tokens: Array<string>
}
logger.info("Using " + process.env.storage + " as storage engine")
logger.info("Using " + process.env.documents + " as document directory")
export class Documents {
    private db: NeDB
    private categories = new Set<string>()
    private dateFrom = new Date()
    private numEntries = 0
    private fulltextDir;

    /**
     * Will create a new database in the basedir, if it does not exist
     * Will create a "fulltext" subdirectory in the basedir, if it does not exist
     * @param basedir 
     */
    constructor(basedir: string) {
        try {
            this.fulltextDir = path.join(basedir, "fulltext")
            fs.mkdir(this.fulltextDir, { recursive: true })
        } catch (err) {

        }
        // this.db = getDatabase({ basedir })
        this.db = new NeDB(basedir)

    }
    /**
     * Always call this method before using the database
     */
    public async initialize() {
        await this.db.createDatabase(docdb)
        await this.db.createDatabase(indexdb)
        await this.rescan()
        logger.info("Database initialized. " + this.numEntries + " posts in " + this.categories.size + " categories")
    }

    /**
     * Read some statistics from the database
     * @returns 
     */
    public async rescan() {
        this.categories.clear()
        this.numEntries = 0
        this.dateFrom = new Date()
        const posts = await this.db.find(docdb, {})
        this.numEntries = posts.length
        for (const p of posts) {
            this.categories.add(p.category)
            const d: Date = new Date(p.created)
            if (d.getTime() < this.dateFrom.getTime()) {
                this.dateFrom = d
            }
        }
    }

    /**
     * Get List of categories
     * @returns 
     */
    public getCategoryList(): Array<string> {
        return [...this.categories]
    }
    /**
     * get the date of the first entry
     * @returns 
     */
    public getFirstDate(): Date {
        return this.dateFrom
    }
    /**
     * get the number of entries
     * @returns 
     */
    public getNumEntries(): number {
        return this.numEntries
    }
    /**
     * add a new entry to the database. If the entry has no _id, generate one. Ensure that the _id is unique.
     * Fulltext will be tokenized and saved in a file in the fulltext directory. 
     * Special links ([[http...]] will be processed and replaced by metadata (if available]])
     * Tokens will be added to the index database. 
     * @param entry 
     * @returns the new entry
     */
    public async add(entry: Blogpost): Promise<Blogpost> {
        if (!entry._id) {
            let exists = null
            do {
                entry._id = (new Date().getTime()).toString(25)
                exists = await this.db.get(docdb, entry._id, { nullIfMissing: true })
            } while (exists)
        }
        let document = entry.fulltext
        delete entry.fulltext
        if (document?.length > 5) {
            const links = document.match(/\[\[[^\]]+\]\]/g)
            if (links) {
                for (const link of links) {
                    if (link.startsWith("[[http")) {
                        const scraper = new MetaScraper(link.substring(2, link.length - 2))
                        if (await scraper.load()) {
                            const img = scraper.getImage()
                            let repl
                            if (img) {
                                repl = {
                                    template: "reference",
                                    url: scraper.getUrl(),
                                    title: scraper.getTitle(),
                                    text: scraper.getText(),
                                    imgurl: scraper.getImage()?.url,
                                    publisherName: scraper.getPublisherName(),
                                    publisherLogo: scraper.getPublisherLogo()?.url
                                }
                            } else {
                                repl = {
                                    template: "link",
                                    url: scraper.getUrl(),
                                    title: scraper.getTitle()
                                }
                            }
                            document = document.replace(link, "[[" + JSON.stringify(repl) + "]]")
                        } else {
                            document = document.replace(link, link.substring(2, link.length - 2))

                        }
                    }
                }
            }
        }
        if (!entry.created) {
            entry.created = new Date()
        }
        entry.modified = new Date()
        entry.filename = await this.tokenizeAndSave(document, entry.teaser, entry.heading, entry._id)
        await this.db.create(docdb, entry)
        this.categories.add(entry.category)
        return entry
    }

    /**
     * Create index entries and store the fulltext as a file in the fulltext directory
     * @param contents fulltext
     * @param summary teaser text
     * @param title title
     * @param id id
     * @param overwrite true if entry with the same title should be overwritten 
     * @returns the full pathname of the newly created file
     */
    async tokenizeAndSave(contents: string, summary: string, title: string, id: string, overwrite = false): Promise<string> {
        const tokens = tokenizer.process(contents + " " + summary + " " + title)
        for (const token of tokens) {
            let index = await this.db.get(indexdb, token, { nullIfMissing: true })
            if (!index) {
                index = { _id: token, posts: [] }
            }
            if (!index.posts.includes(id)) {
                index.posts.push(id)
                await this.db.update(indexdb, token, index)
            }
        }
        const outfile = await this.makeFilename(title, overwrite)
        await fs.writeFile(outfile, contents)
        return path.basename(outfile)
    }

    /**
     * remove a database entry and the corresponding fulltext file, and the corresponding index entries
     * @param id id of the post to remove
     */
    public async remove(id: string): Promise<void> {
        const entry = await this.db.get(docdb, id)
        await this.db.remove(docdb, id)
        const existing = await this.db.find(indexdb, { posts: { $elemMatch: id } })
        for (const e of existing) {
            e.posts = e.posts.filter(p => p !== id)
            if (e.posts.length == 0) {
                await this.db.remove(indexdb, e._id)
            } else {
                await this.db.update(indexdb, e._id, e)
            }
        }
        try {
            await fs.rm(path.join(this.fulltextDir, entry.filename))
        } catch (err: any) {
            logger.error("Error removing file " + entry.filename + " " + err.message)
        }
        await this.rescan()
    }

    /**
     * Update a post. The fulltext will be re-tokenized and saved in a file in the fulltext directory. 
     * Existing tokens will be removed and new tokens will be added to the index database
     * @param entry 
     * @returns the new post
     */
    public async update(entry: Blogpost): Promise<Blogpost> {
        await this.remove(entry._id)
        entry.created = new Date(entry.created)
        return this.add(entry)
    }

    /**
     * Update the metadata of a post. The fulltext will not be changed.
     * @param entry 
     * @returns 
     */
    public async updateMeta(entry: Blogpost): Promise<Blogpost> {
        entry.created = new Date(entry.created)
        delete entry.fulltext
        entry.modified = new Date()
        await this.db.update(docdb, entry._id, entry)
        return entry
    }

    private makedate(date: string, endOfYear: boolean): Date {
        if (date.length == 4) {
            return new Date(date + (endOfYear ? "-12-31" : "-01-01"))
        } else {
            return new Date(date)
        }
    }
    /**
     * Find posts matching given criteria
     * @param q [Category, from, until, between, text]
     * @returns a (possibly empty) list of posts
     */
    public async find(q: any): Promise<Array<Blogpost>> {
        const query: any = {}
        const id = q['id']
        if (id) {
            const entry = await this.db.get(docdb, id, { nullIfMissing: true })
            if (entry) {
                return [entry]
            } else {
                return []
            }
        }
        const cat = q['category']
        if (cat) {
            query.category = cat
        }
        const from = q["from"]
        if (from) {
            query.created = { $gte: this.makedate(from, false) }
        }
        const until = q["until"]
        if (until) {
            query.created = { $lte: this.makedate(until, true) }
        }
        const between = q["between"]
        if (between) {
            const cr = between.split(/,/)
            query.$and = [{ created: { $gte: this.makedate(cr[0], false) } }, { created: { $lte: this.makedate(cr[1], true) } }]
        }
        const prio = q["priority"]
        if (prio) {
            query.priority = parseInt(prio)
        }
        const featured = q["featured"]
        if (featured) {
            query.featured = featured == "true" ? true : false
        }
        const skip = parseInt(q['skip'] || "0")
        const limit = parseInt(q['limit'] || "1000")
        let posts: Array<Blogpost> = await this.db.find(docdb, query, skip, limit)
        const keyword = q['text']
        if (keyword) {
            const found = await this.db.get(indexdb, keyword, { nullIfMissing: true })
            if (found) {
                posts = posts.filter(p => found.posts.includes(p._id))
            } else {
                posts = []
            }
        }
        return posts
    }

    /**
     * Get a post by id. Fulltext will be loaded and processed, and attached to the fulltext property of the post
     * @param id 
     * @param raw True: return fulltext as is, false: Link metadata will be processed and markdown will be compiled.
     * @returns the post with fulltext-property set tu the fulltext
     */
    public async get(id: string, raw: boolean): Promise<Blogpost> {
        const entry = await this.db.get(docdb, id, { nullIfMissing: true })
        if (entry) {
            let processed = await this.loadContents(entry)
            if (!raw) {
                processed.fulltext = (await processContents(processed.fulltext))
            }
            return processed
        } else {
            return null
        }
    }

    public async getMeta(id: string): Promise<Blogpost> {
        const entry = await this.db.get(docdb, id, { nullIfMissing: true })
        return entry
    }

    /**
     * Load the contents of a document in the post structure
     * @param entry 
     * @returns 
     */
    public async loadContents(entry: Blogpost): Promise<Blogpost> {
        const filename = entry.filename
        if (!filename) {
            throw new Error("No filename supplied " + JSON.stringify(entry))
        }
        entry.fulltext = await fs.readFile(path.join(this.fulltextDir, filename), "utf-8")
        return entry
    }


    /**
     * generate a filepath from a title and the documents basedir. All non-alphanomeric characters are replaced with "_"
     * @param title 
     * @param overwrite if true, the pathmame will returns as is. If false, the name will be modified, if a file with that name already exists.
     * @returns the full filepath of the document
     */
    private async makeFilename(title: string, overwrite = false): Promise<string> {
        if(!title) {
            title=new Date().toISOString()+Math.random().toString(36).substring(2, 15)
        }
        const fname = title.toLocaleLowerCase().replace(/[^\w]+/g, "_")
        let fullpath = path.join(this.fulltextDir, fname)
        if (fullpath.endsWith("_")) {
            fullpath = fullpath.slice(0, -1)
        }
        if (!overwrite) {
            do {
                try {
                    await fs.stat(fullpath)
                    fullpath += "_"
                } catch (err) {
                    break;
                }
            } while (true)
        }
        return fullpath
    }


    /**
     * Filter an array of post to files containing a keyword in the fulltext
     * @param posts list to consider
     * @param keyword keyword to match
     * @returns reduced list, can be empty
     */
    public async filter(posts: Array<Blogpost>, keyword: string): Promise<Array<Blogpost>> {
        const found = await this.db.get(indexdb, keyword)
        const ret = posts.filter(p => found.posts.includes(p._id))
        return ret
    }
}