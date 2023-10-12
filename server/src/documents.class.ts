import fs from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import { post } from './types'
import { marked } from 'marked'
import { MetaScraper, type imageObject } from './scrapers'
import { getDatabase } from './database/db'
import { v4 as uuid } from 'uuid'

export type analyzed = {
    filename: string
    tokens: Array<string>
}
export class Documents {
    private db
    private categories = new Set<string>()
    private dateFrom = new Date()
    private numEntries = 0

    constructor(private basedir: string, private indexdir: string) {
        try {
            fs.mkdir(basedir, { recursive: true })
        } catch (err) {

        }
        try {
            fs.mkdir(indexdir, { recursive: true })
        } catch (err) {

        }
        this.db = getDatabase()
        this.db.use("nbb")
        this.db.find({}).then((posts: Array<post>) => {
            this.numEntries = posts.length
            for (const p of posts) {
                this.categories.add(p.category)
                const d: Date = new Date(p.created)
                if (d.getTime() < this.dateFrom.getTime()) {
                    this.dateFrom = d
                }
            }
        })
    }

    public getCategoryList(): Array<string> {
        return [...this.categories]
    }
    public getFirstDate(): Date {
        return this.dateFrom
    }
    public getNumEntries(): number {
        return this.numEntries
    }
    public async add(entry: post): Promise<post> {
        const document = entry.fulltext
        if (!entry._id) {
            entry._id = uuid()
        }
        delete entry.fulltext
        const stored = await this.addToIndex(entry._id, document, entry.heading)
        entry.filename = stored.filename
        if (!entry.created) {
            entry.created = new Date()
        }
        entry.modified = new Date()
        await this.db.create(entry)
        this.categories.add(entry.category)
        return entry
    }

    public async update(entry: post): Promise<post> {
        const document = entry.fulltext
        delete entry.fulltext
        entry.modified = new Date()
        await this.db.update(entry._id, entry)
        const stored = await this.replaceDocument(entry._id, document, entry.heading)
        this.categories.add(entry.category)
        return entry
    }

    public async updateMeta(entry: post): Promise<post> {
        entry.created = new Date(entry.created)
        delete entry.fulltext
        entry.modified = new Date()
        await this.db.update(entry._id, entry)
        return entry
    }
    public async find(q: any): Promise<Array<post>> {
        const query: any = {}

        const cat = q['category']
        if (cat) {
            query.category = cat
        }
        const sum = q['summary']
        if (sum) {
            query.teaser = new RegExp(sum)
        }
        const from = q["from"]
        if (from) {
            query.created = { $gte: new Date(from + "-01-01") }
        }
        const until = q["until"]
        if (until) {
            query.created = { $lte: new Date(until + "-12-31") }
        }
        const between = q["between"]
        if (between) {
            const cr = between.split(/[,\-]/)
            query.$and = [{ created: { $gte: new Date(cr[0] + "-01-01") } }, { created: { $lte: new Date(cr[1] + "-12-31") } }]
        }
        let posts: Array<post> = await this.db.find(query)
        const matcher = q['fulltext']
        if (matcher) {
            posts = await this.filter(posts, matcher)
        }
        return posts
    }

    public async get(id: string, raw: boolean): Promise<post> {
        const entry = await this.db.get(id)
        let processed = await this.loadContents(entry)
        if (!raw) {
            processed = (await this.processContents(processed)) as post
        }
        return processed
    }
    /**
     * Tokenize a document, store its contents as file in the basedir and add its contents to the index.
     * @param id id of the file (will be used as reference in the index entries)
     * @param contents contents of the file in  recognized format
     * @param title title (to be used as filename)
     * @returns {filename, tokens:Array<string>}
     */
    public async addToIndex(id: string, contents: string, title: string): Promise<analyzed> {
        // check for embedded links
        if (!id || !contents || !title) {
            throw new Error("Missing parameter")
        }
        const links = contents.match(/\[\[[^\]]+\]\]/g)
        if (links) {
            for (const link of links) {
                const scraper = new MetaScraper(link.substring(2, link.length - 2))
                if (await scraper.load()) {
                    const repl = {
                        template: "reference",
                        url: scraper.getUrl(),
                        title: scraper.getTitle(),
                        text: scraper.getText(),
                        imgurl: scraper.getImage().url
                    }
                    contents = contents.replace(link, JSON.stringify(repl))
                }
            }
        }

        const parsed = await this.parseString(contents, title)
        // add tokens to index
        for (const token of parsed.tokens) {
            let cont = ""
            try {
                cont = await fs.readFile(path.join(this.indexdir, token), "utf-8")
            } catch (err) {
                // not found
            }
            cont += id + "\n"
            await fs.writeFile(path.join(this.indexdir, token), cont)
        }
        return parsed
    }
    /**
     * Replace existing document: Remove all index entries and the file and write it new
     * @param id 
     * @param contents 
     * @param title 
     * @returns 
     */
    public async replaceDocument(id: string, contents: string, title: string): Promise<analyzed> {
        if (!id || !contents || !title) {
            throw new Error("Missing parameter")
        }
        await this.removeFromIndex(id)
        const filename = await this.makeFilename(title, true)
        await fs.rm(filename)
        return await this.addToIndex(id, contents, title)
    }

    /**
     * Remove a post rference from the index
     * @param id id of the removed post
     */
    public async removeFromIndex(id: string) {
        if (!id) {
            throw new Error("Missing parameter")
        }
        const kws = await fs.readdir(this.indexdir)
        for (const file of kws) {
            try {
                const cont = await fs.readFile(path.join(this.indexdir, file), "utf-8")
                const modified = cont.replaceAll(id + "\n", "")
                await fs.writeFile(path.join(this.indexdir, file), modified)
            } catch (err) {
                // not found
            }
        }
    }
    /**
     * Lod the contents of a document in the post structure
     * @param entry 
     * @returns 
     */
    public async loadContents(entry: post): Promise<post> {
        const filename = entry.filename
        if (!filename) {
            throw new Error("No filename supplied " + JSON.stringify(entry))
        }
        entry.fulltext = await fs.readFile(path.join(this.basedir, filename), "utf-8")
        return entry
    }

    public async processContents(entry: Partial<post>): Promise<Partial<post>> {
        if (!entry?.fulltext) {
            throw new Error("No fulltext supplied " + JSON.stringify(entry))
        }
        const processed = await this.process(entry.fulltext)
        entry.fulltext = marked.parse(processed)
        return entry
    }
    async process(text: string): Promise<string> {
        const links = text.match(/\[\[[^\]]+\]\]/g)
        if (!links) {
            return text
        }
        for (const link of links) {
            try {
                const ref = JSON.parse(link.substring(2, link.length - 2))
                let partial = await fs.readFile(path.join(process.env.partials, ref.template + ".html"), "utf-8")
                const tokens = partial.match(/\[\[[^\]]+\]\]/g)
                for (const token of tokens) {
                    const repl = ref[token.substring(2, token.length - 2)]
                    if (repl) {
                        partial = partial.replace(token, repl)
                    }
                }
                text = text.replace(link, partial)
            } catch (err) {
                text = text.replace(link, "error")
            }

        }

        return text
    }

    /**
     * generate a filepath from a title and the documents basedir. All non-alphanomeric characters are replaced with "_"
     * @param title 
     * @param overwrite if true, the pathmame will returns as is. If false, the name will be modified, if a file with that name already exists.
     * @returns 
     */
    private async makeFilename(title: string, overwrite = false): Promise<string> {
        const fname = title.toLocaleLowerCase().replace(/[^\w]+/g, "_")
        let fullpath = path.join(this.basedir, fname)
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
     * tokenize a file, copy it to the document basedir and return the tokens and the generated filename
     * @param filename full path name of the file to parse
     * @param title title for the created file in docbase
     * @param overwrite if true, overwrites existing file. If false, modifies title
     * @returns 
     */
    public parseFile(filename: string, title = path.basename(filename), overwrite = false): Promise<analyzed> {
        return new Promise(async (resolve, reject) => {
            const words = []
            const instr = createReadStream(filename)
            const outfile = await this.makeFilename(title, overwrite)
            const outstr = createWriteStream(outfile)
            instr.on('data', chunk => {
                outstr.write(chunk)
                const tokens = chunk.toString().split(/[^\w]+/)
                words.push(...tokens)
            })
            instr.on('end', () => {
                outstr.close()
                const uniq = [...new Set(words.map(w => w.toLowerCase()))]
                resolve({ tokens: uniq.filter(n => n.length > 3), filename: path.basename(outfile) })
            })
            instr.on('error', err => {
                reject(err)
            })

        })
    }

    /**
     * tokenize a string, write it as a file to the docbase and return the tokens and the filename
     * @param input contents of the file
     * @param title filename to use. Will be modified if file with the same bname already exists
     * @param overwrite if true, overwrites existing file. If false, modifies title
     * @returns {filename,tokens:Array<String>}
     */
    public async parseString(input: string, title: string, overwrite = false): Promise<analyzed> {
        const outfile = await this.makeFilename(title, overwrite)
        await fs.writeFile(outfile, input)
        const words = input.split(/[^\w]+/)
        const uniq = [...new Set(words.map(w => w.toLowerCase()))]
        return ({ tokens: uniq.filter(n => n.length > 3), filename: path.basename(outfile) });
    }



    /**
     * Filter an array of post to files containing a keyword in the fulltext
     * @param posts list to consider
     * @param criteria keyword to match
     * @returns reduced list, kan be empty
     */
    public async filter(posts: Array<post>, criteria: string): Promise<Array<post>> {
        const ret: Array<post> = []
        const ids: Array<string> = []
        const files = await fs.readdir(this.indexdir)
        for (const file of files) {
            if (file.match(criteria)) {
                const kw = await fs.readFile(path.join(this.indexdir, file), "utf-8")
                const id = kw.split(/\n/)
                ids.push(...id)
            }
        }
        for (const post of posts) {
            for (const id of ids.filter(i => i.length > 0)) {
                if (id === post._id) {
                    ret.push(post)
                    break;
                }
            }
        }
        return ret
    }
}