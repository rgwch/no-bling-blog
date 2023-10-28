import htmlmeta from 'html-metadata'

// const metascraper = metaScraper([description(), title(), date(), author()])

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
        image: Array<imageObject | string>
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
    // private metadata: metadata
    private author: string
    private image: imageObject
    private title: string
    private description: string

    constructor(private url: string) {

    }
    public async load(): Promise<boolean> {
        try {
            const meta = await htmlmeta(this.url)
            if (meta.jsonLd) {
                if (Array.isArray(meta.jsonLd)) {
                    for (const el of meta.jsonLd) {
                        if (this.loadMeta(el)) {
                            return true
                        }
                    }
                } else {
                    if (this.loadMeta(meta.jsonLd)) {
                        return true
                    }
                }
            }
            return false
        } catch (err) {
            console.log(err)
            return false
        }
    }

    private loadMeta(el): boolean {
        if (el["@type"] === "NewsArticle") {
            if (Array.isArray(el.author)) {
                this.author = el.author[0].name || "anonymous"
            } else {
                this.author = el.author?.name || "anonymous"
            }
            if (Array.isArray(el.image)) {
                this.image = this.loadImage(el.image[0])
            } else {
                this.image = this.loadImage(el.image)
            }
            this.title = el.title || el.headline
            this.description = el.description || el.headline
            if (this.title == this.description) {
                this.description = ""
            }
            return true
        } else if (el["@type"] === "BreadcrumbList") {
            const elements: Array<any> = el.itemListElement
            const last = elements[elements.length - 1]
            this.title = last.item.name
            this.description = "" // last.item["@id"]
            return true
        }
        return false

    }

    private loadImage(el: imageObject | string): imageObject {
        if (typeof el == "string") {
            return {
                "@type": "ImageObject",
                url: el,
                height: 0,
                width: 0
            }
        } else {
            return el
        }
    }
    public getAuthor(): string {
        return this.author
    }
    public getImage(): imageObject {
        return this.image
    }
    public getTitle(): string {
        return this.title
    }
    public getText(): string {
        return this.description
    }
    public getUrl = (): string => this.url

}

