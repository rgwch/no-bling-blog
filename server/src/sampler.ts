import { getDatabase } from "./db";
import { post } from './types'
import { v4 as uuid } from 'uuid'
import { Documents } from './documents.class'

const db = getDatabase()
db.use("nbb")
console.log(process.cwd())

const docs = new Documents(process.env.documents, process.env.index)
docs.parseFile("../data/sample.html", "ein erster Test").then(async t => {
    const tokens:Array<string>=t.tokens
    for (let i = 0; i < 100; i++) {
        const p: post = {
            _id: uuid(),
            heading: getWords(tokens, 5),
            teaser: getWords(tokens, 20),
            fulltext: getWords(tokens, 100),
            keywords: "",
            category: getWords(tokens.slice(800,810), 1),
            author: "gerry",
            created: new Date(),
            modified: new Date(),
            published: true
        }
        const tokenized = await docs.addToIndex(p._id, p.fulltext, p.heading)
        p.fulltext = tokenized.filename
        const result = await (db.create(p))
    }
})

function getWords(tokens: Array<string>, num: number): string {
    let ret: string = ""
    for (let i = 0; i < num; i++) {
        const rnd = Math.round(tokens.length * Math.random())
        ret = ret + tokens[rnd] + " "
    }
    return ret
}

