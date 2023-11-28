import fs from 'fs/promises'
const source0 = "https://www.tagesanzeiger.ch/julian-assange-darf-nicht-ausgeliefert-werden-993647635714"
const source1 = "https://www.infosperber.ch/medien/ueber-tv-radio/windschiefer-bericht-ueber-irak-auf-tv-srf/"
const source2 ="https://twitter.com/StefWerner/status/1729390892891406443"
const source3="https://www.nzz.ch/feuilleton/der-erste-roman-von-joel-dicker-seit-2018-ld.1609969"
const source4="https://www.infosperber.ch/politik/welt/neustes-zum-maidan-ein-putsch-und-keine-revolution-in-wuerde/"
import { MetaScraper } from ".";

test("metaparser", async () => {
    const scraper = new MetaScraper(source4)
    expect(await scraper.load()).toBeTruthy()
    expect(scraper.getTitle()).toBeDefined()
})

