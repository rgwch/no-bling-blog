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

