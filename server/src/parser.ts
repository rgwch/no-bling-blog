import fs from 'fs'
import path from 'path'
import { post } from "./types"
import { getDatabase } from './db'
const db=getDatabase()


function makeFilename(title: string): string {
    const fname = title.toLocaleLowerCase().replace(/[^\w]+/g, "_")
    let basedir = process.env.documents || "../data/documents"
    if (!fs.existsSync(basedir)) {
        fs.mkdirSync(basedir, { recursive: true })
    }
    let fullpath = path.join(basedir, fname)
    while (fs.existsSync(fullpath)) {
        fullpath += "_"
    }
    return fullpath
}

export async function parseFile(filename: string, title = path.basename(filename)): Promise<any> {
    return new Promise((resolve, reject) => {
        const words = []
        const instr = fs.createReadStream(filename)
        const outfile = makeFilename(title)
        const outstr = fs.createWriteStream(outfile)
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

export async function parseString(input: string, title: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const outfile = makeFilename(title)
        fs.writeFile(outfile, input, (err) => {
            if (err) {
                reject(err)
            } else {
                const words = input.split(/[^\w]+/)
                const uniq = [...new Set(words.map(w => w.toLowerCase()))]
                resolve({ tokens: uniq.filter(n => n.length > 3), filename: path.basename(outfile) });
            }
        }
        )
    })
}

