import fs from 'fs/promises'
// const source = "https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"
const source = "https://www.infosperber.ch/medien/ueber-tv-radio/windschiefer-bericht-ueber-irak-auf-tv-srf/"
import { MetaScraper } from ".";

test("metaparser", async () => {
    const scraper = new MetaScraper(source)
    expect(await scraper.load()).toBeTruthy()
    expect(scraper.getTitle()).toBeDefined()
})

