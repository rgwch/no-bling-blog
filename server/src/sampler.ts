import 'dotenv/config'
import { getDatabase } from "./database/db";
import { post } from './types'
import { v4 as uuid } from 'uuid'
import { Documents } from './documents.class'

const db = getDatabase()
db.use("nbb")
console.log(process.cwd())

const docs = new Documents(process.env.documents, process.env.index)
docs.parseFile("../data/sample.html", "ein erster Test").then(async t => {
    const tokens: Array<string> = t.tokens
    for (let i = 0; i < 100; i++) {
        const p: post = {
            _id: uuid(),
            heading: getWords(tokens, 5),
            teaser: getWords(tokens, 20),
            fulltext: getWords(tokens, 100),
            filename: "",
            keywords: "",
            category: getWords(tokens.slice(800, 810), 1),
            author: "gerry",
            created: getRandomDate(new Date('2018-02-12T01:57:45.271Z'), new Date('2023-09-30T01:57:45.271Z')),
            modified: new Date(),
            published: true
        }
        const tokenized = await docs.addToIndex(p._id, p.fulltext, p.heading)
        p.filename = tokenized.filename
        delete p.fulltext
        const result = await (db.create(p))
    }
})

function getWords(tokens: Array<string>, num: number): string {
    let ret: string = ""
    for (let i = 0; i < num; i++) {
        const rnd = Math.round(tokens.length * Math.random())
        ret = ret + tokens[rnd] + " "
    }
    return ret.trim()
}

function getRandomDate(from: Date, to: Date): Date {
    const fromTime = from.getTime();
    const toTime = to.getTime();
    return new Date(fromTime + Math.random() * (toTime - fromTime));
}
