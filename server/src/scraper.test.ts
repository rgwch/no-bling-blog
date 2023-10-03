import { Scraper } from "./scraper";
import fs from 'fs/promises'
const source="https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"


test("fetch", async () => {
    const scraper = new Scraper();
    const html=await scraper.fetch(source)
    expect(html).toBeDefined()
    await fs.writeFile("test.html",html)
})


