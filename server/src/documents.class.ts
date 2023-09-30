import fs from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import { post } from './types'
export class Documents {

    constructor(private basedir: string, private indexdir: string) {
        try {
            fs.mkdir(basedir, { recursive: true })
        } catch (err) {

        }
        try {
            fs.mkdir(indexdir, { recursive: true })
        } catch (err) {

        }
    }

    /**
     * Tokenize a document, store its contents as file in the basedir and add its contents to the index.
     * @param id id of the file (will be used as reference in the index entries)
     * @param contents contents of the file in  recognized format
     * @param title title (to be used as filename)
     * @returns {filename, tokens:Array<string>}
     */
    public async addToIndex(id: string, contents: string, title: string) {
        const parsed = await this.parseString(contents, title)
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
     * Lod the contents of a document in the post structure
     * @param entry 
     * @returns 
     */
    public async loadContents(entry: post): Promise<post> {
        const filename = entry.fulltext
        if (!filename) {
            throw new Error("No filename supplied " + JSON.stringify(entry))
        }
        const contents = await fs.readFile(path.join(this.basedir, filename), "utf-8")
        entry.fulltext = contents
        return entry
    }

    private async makeFilename(title: string): Promise<string> {
        const fname = title.toLocaleLowerCase().replace(/[^\w]+/g, "_")
        let fullpath = path.join(this.basedir, fname).slice(0, -1)
        do {
            try {
                await fs.stat(fullpath)
                fullpath += "_"
            } catch (err) {
                break;
            }
        } while (true)
        return fullpath
    }

    public parseFile(filename: string, title = path.basename(filename)): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const words = []
            const instr = createReadStream(filename)
            const outfile = await this.makeFilename(title)
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
     * @returns {filename,tokens:Array<String>}
     */
    public async parseString(input: string, title: string): Promise<any> {
        const outfile = await this.makeFilename(title)
        await fs.writeFile(outfile, input)
        const words = input.split(/[^\w]+/)
        const uniq = [...new Set(words.map(w => w.toLowerCase()))]
        return ({ tokens: uniq.filter(n => n.length > 3), filename: path.basename(outfile) });
    }



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