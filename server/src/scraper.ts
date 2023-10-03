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
        if (main) {
            const first = main.item(0)
            console.log(first)
        }

        return ""
    }
}