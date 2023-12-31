/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import path from "path"
import fs from "fs/promises"

/**
 * Process embedded Meta-Ibnformation and compile Markdown
 */
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);


export async function processContents(text: string): Promise<string> {
  if (!text) {
    throw new Error("No fulltext supplied to processContents")
  }
  let processed = await processPartials(text)
  processed = processed.replace(/^-([a-z]*)$/gm, "~~~$1")
  text = await marked.parse(processed)
  return text
}

async function processPartials(text: string): Promise<string> {

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
        } else {
          partial = partial.replace(token, "")
        }
      }
      text = text.replace(link, partial)
    } catch (err) {
      text = text.replace(link, "error")
    }

  }

  return text
}

