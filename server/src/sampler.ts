/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/


import { post } from './types'
import { Documents } from './documents.class'

/** 
 * Create 100 sanple posts for NoBlingBlog from random extracts of a html file
 */

export async function createDummyPosts(docs: Documents) {
    const t = await docs.parseFile("../data/sample.html", "ein erster Test")
    const tokens: Array<string> = t.tokens
    for (let i = 0; i < 100; i++) {
        const p = {
            heading: getWords(tokens, 5),
            teaser: getWords(tokens, 20),
            fulltext: getWords(tokens, 100),
            filename: "",
            keywords: "",
            category: getWords(tokens.slice(800, 810), 1),
            author: "anonymous",
            created: getRandomDate(new Date('2018-02-12T01:57:45.271Z'), new Date('2023-09-30T01:57:45.271Z')),
            modified: new Date(),
            published: true
        }
        await docs.add(p as post)
    }
}

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
