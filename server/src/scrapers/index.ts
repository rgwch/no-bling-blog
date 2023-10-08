import tagiScraper from "./tagiscraper";
import author from 'metascraper-author'
import description from 'metascraper-description'
import title from 'metascraper-title'
import date from 'metascraper-date'
import metaScraper from 'metascraper'
import htmlmeta from 'html-metadata'

const metascraper = metaScraper([description(), title(), date(), author()])
export type imageObject = {
    "@type": "ImageObject",
    url: string,
    alt?: string
    height: number,
    width: number
}
type metadata = {
    general: any,
    jsonLd: [{
        "@context": string,
        "@type": "NewsArticle",
        title: string,
        description: string,
        headline: string,
        image: Array<imageObject>
        dateModified: string,
        datePublished: string,
        isAccessibleForFree: boolean,
        publisher: {
            name: string,
            logo: imageObject
        },
        author: [{
            "@type": string,
            name: string,
            url: string
        }],
    }],
    openGraph: {
        admins: Array<string>,
        app_id: string,
        site_name: string,
        title: string,
        url: string,
        type: string,
        description: string,
        image: imageObject
    },

}

export class MetaScraper {
    private metadata: metadata
    private author: string
    private image: imageObject
    private title: string
    private description: string

    constructor(private url: string) {

    }
    public async load(): Promise<boolean> {
        try {
            /*
            const response = await fetch(url)
            if (response.ok) {
                const html = await response.text()
                const parsed = await metascraper({ url, html })
                return parsed
            }
            */
            const meta = await htmlmeta(this.url)
            if (meta.jsonLd) {
                if (Array.isArray(meta.jsonLd)) {
                    for (const el of meta.jsonLd) {
                        if (el["@type"] == "NewsArticle") {
                            this.metadata = meta
                            this.loadMeta(el)
                            return true
                        }
                    }

                } else {
                    this.metadata = meta
                    this.loadMeta(meta.jsonLd)
                    return true
                }
                return false
            }
        } catch (err) {
            console.log(err)
            return false
        }
    }
    private loadMeta(el) {
        if (Array.isArray(this.author)) {
            this.author = el.author[0].name
        } else {
            this.author = el.author.name || "anonymous"
        }
        if (Array.isArray(el.image)) {
            this.image = el.image[0]
        } else {
            this.image = el.image
        }
        this.title = el.title || el.headline
        this.description = el.description || el.headline

    }
    public getAuthor() {
        return this.author
    }
}

