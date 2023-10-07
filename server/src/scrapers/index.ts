import tagiScraper from "./tagiscraper";
import author from 'metascraper-author'
import description from 'metascraper-description'
import title from 'metascraper-title'
import date from 'metascraper-date'
import metaScraper from 'metascraper'
import htmlmeta from 'html-metadata'

const metascraper = metaScraper([description(), title(), date(), author()])


export async function fetchContent(url: string): Promise<any> {
    try {
        /*
        const response = await fetch(url)
        if (response.ok) {
            const html = await response.text()
            const parsed = await metascraper({ url, html })
            return parsed
        }
        */
        const meta = await htmlmeta(url)
        return meta
    } catch (err) {
        console.log(err)
        return undefined
    }
}
/*
if (url.toLocaleLowerCase().startsWith("https://www.tages-anzeiger.ch/")) {
    return tagiScraper(url)
}
*/
