import { Scraper } from "./scraper";
import fs from 'fs/promises'
const source = "https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"
const blick = "https://www.blick.ch/wirtschaft/muenze-aus-dem-wallis-kommt-unter-den-hammer-dieses-goldvreneli-ist-ein-vermoegen-wert-id19014385.html"
const spiegel = "https://www.spiegel.de/ausland/hamas-krieg-gegen-israel-raketeneinschlag-bei-live-schalte-a-b7765228-a0f0-4992-b878-b1c2dfe30843"
import { MetaScraper } from "./scrapers";

test("metaparser", async () => {
    const scraper = new MetaScraper(spiegel)
    expect(await scraper.load()).toBeTruthy()
    expect(scraper.getAuthor()).toBeDefined()
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
