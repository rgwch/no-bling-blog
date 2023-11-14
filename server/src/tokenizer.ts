/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import fs from "fs"
import path from 'path'
/**
 *  Split a text into tokens for an index database
 */
export class Tokenizer {
    private stopWords: string[] = []
    public process(text: string): string[] {
        if (this.stopWords.length == 0) {
            this.stopWords = fs.readFileSync(path.join(process.env.basedir, "stopwords.txt"), "utf8").split("\n")
        }
        const words = new Set(text.split(/[^\w]+/).map(w => w.toLowerCase()).filter(word => word.length > 2 && !this.stopWords.includes(word)))
        return [...words]
    }
}

export const tokenizer = new Tokenizer()