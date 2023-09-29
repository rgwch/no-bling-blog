import { getDatabase } from "./db";
import { parseFile, store } from "./parser";
import { post } from './types'
import { v4 as uuid } from 'uuid'

const db = getDatabase()
db.use("nbb")
console.log(process.cwd())

parseFile("../data/sample.html", "ein erster Test").then(async t => {
    for (let i = 0; i < 100; i++) {
        const p: post = {
            _id: uuid(),
            heading: getWords(t.tokens, 5),
            teaser: getWords(t.tokens, 20),
            fulltext: getWords(t.tokens, 100),
            keywords: "",
            category: getWords(t.tokens, 1),
            author: "gerry",
            created: new Date(),
            modified: new Date(),
            published: true
        }
        await store(p)
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