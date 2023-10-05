import { DOMParser } from 'xmldom';
const parser = new DOMParser()

export class Scraper {
    async fetch(url: string): Promise<string> {
        const response = await fetch(url)
        if (response.ok) {
            const html = await response.text()
            return html
        }
        return ""
    }

    async scrape(html: string) {
        const dom = parser.parseFromString(html)
        const main = dom.getElementsByTagName("main")
        let author = ""
        let title = ""
        let lead = ""
        if (main) {
            const first = main.item(0)
            if (first) {
                const divs = first.getElementsByTagName("div")
                const ar = Array.from(divs)
                for (const div of ar) {
                    const cl = div.getAttribute("class")
                    if (cl?.includes("author")) {
                        author = div.innerHTML
                        console.log("author")
                    }
                    if (cl?.includes("title")) {
                        title = div.innerHTML
                        console.log("title")
                    }
                    if (cl?.includes("content")) {
                        console.log("content")
                    }
                    if (cl.includes("lead")) {
                        lead = div.innerHTML
                        console.log("lead")
                    }
                };
            }
        }

        return {author,title,lead}
    }


}