import { getDatabase } from "./db";
import { parse } from "./parser";
import {post} from './types'
import {v4 as uuid} from 'uuid'

const db=getDatabase()
db.use("nbb")

parse("../data/sample.html").then(async tokens=>{
    for(let i=0;i<100;i++){
        const p:post={
            _id: uuid(),
            heading: getWords(tokens,5),
            teaser: getWords(tokens,20),
            fulltext: getWords(tokens,100),
            keywords: "",
            category: getWords(tokens,1),
            author: "gerry",
            created: new Date(),
            modified: new Date(),
            published: true
        }
        await db.create(p)
    }
})

function getWords(tokens:Array<string>,num:number):string{
    let ret:string=""
    for(let i=0;i<num;i++){
        const rnd=Math.round(tokens.length*Math.random())
        ret=ret+tokens[rnd]+" "
    }
    return ret
}