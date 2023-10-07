import { Scraper } from "./scraper";
import fs from 'fs/promises'
const source = "https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"
import { fetchContent } from "./scrapers";

test ("metaparser", async()=>{
    const result = await fetchContent(source)
})

xtest("fetch", async () => {
    const scraper = new Scraper();
    try {
        const stat = await fs.stat("test.html")
        expect(stat).toBeDefined()
    } catch (err) {
        const html = await scraper.fetch(source)
        expect(html).toBeDefined()
        await fs.writeFile("test.html", html)

    }
})

xtest("scrape", async () => {
    const scraper = new Scraper()
    const html = await fs.readFile("test.html", "utf8")
    const result = await scraper.scrape(html)
    expect(result).toBeDefined()
})
