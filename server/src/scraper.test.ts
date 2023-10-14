import fs from 'fs/promises'
const source = "https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"
import { MetaScraper } from "./scrapers";

xtest("metaparser", async () => {
    const scraper = new MetaScraper(source)
    expect(await scraper.load()).toBeTruthy()
    expect(scraper.getAuthor()).toBeDefined()
})

