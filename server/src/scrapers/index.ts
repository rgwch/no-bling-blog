import htmlmeta from 'html-metadata'
import { logger } from '../logger'

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
        "@type": string,
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
    private publisherName: string
    private publisherLogo: imageObject
    private meta: metadata

    constructor(private url: string) {

    }
    public async load(): Promise<boolean> {
        try {
            this.meta = await htmlmeta(this.url)
            if (this.meta.jsonLd) {
                if (Array.isArray(this.meta.jsonLd)) {
                    let description = this.meta.jsonLd.find(el => el["@type"] === "NewsArticle") || this.meta.jsonLd.find(el => el["@type"] === "BreadcrumbList")
                    if (description) {
                        return this.loadMeta(description)
                    }
                } else {
                    if (this.loadMeta(this.meta.jsonLd)) {
                        return true
                    }
                }
            } else if (this.meta.openGraph) {
                this.title = this.meta.openGraph.title || this.meta.general?.title || ""
                this.description = this.meta.openGraph.description || this.meta.general?.description || ""
                this.image = this.loadImage(this.meta.openGraph.image)
                this.author = this.meta.general?.author || "anonymous"
                return this.title != "" || this.description != "" || this.image != null
            } else {
                return false

            }
        } catch (err) {
            logger.warn(err)
            return false
        }
    }

    private loadMeta(el): boolean {
        if (el["@type"] === "NewsArticle") {
            if (Array.isArray(el.author)) {
                this.author = el.author[0].name || "anonymous"
            } else {
                this.author = el.author?.name || this.meta.general.author || "anonymous"
            }
            if (Array.isArray(el.image)) {
                this.image = this.loadImage(el.image[0])
            } else {
                if (el.image) {
                    this.image = this.loadImage(el.image)
                } else {
                    if (this.meta.openGraph?.image) {
                        this.image = this.loadImage(this.meta.openGraph?.image)
                    }
                }
            }
            this.title = el.title || el.headline
            if (!this.title) {
                this.title = this.meta.openGraph?.title
            }
            this.description = el.description
            if (!this.description) {
                this.description = this.meta.openGraph?.description
            }
            if (this.title == this.description) {
                this.description = ""
            }
            const publisher = el.publisher
            if (el.publisher) {
                this.publisherName = publisher.name
                this.publisherLogo = this.loadImage(publisher.logo)
            }
            return true
        } else if (el["@type"] === "BreadcrumbList") {
            const elements: Array<any> = el.itemListElement
            const last = elements[elements.length - 1]
            this.title = last.item?.name || last.name
            if (!this.title) {
                this.title = this.meta.openGraph?.title || this.meta.general?.title || ""
            }
            this.description = this.meta.openGraph?.description
            if (this.meta.openGraph?.image) {
                this.image = this.loadImage(this.meta.openGraph?.image)
            }
            this.author = this.meta.general?.author || "anonymous"
            return true
        }
        return false

    }

    private loadImage(el: imageObject | string): imageObject {
        if (!el) {
            return null
        }
        if (typeof el == "string") {
            return {
                "@type": "ImageObject",
                url: el,
                height: 0,
                width: 0
            }
        } else if (Array.isArray(el)) {
            return this.loadImage(el[0])
        } else {
            return el
        }
    }
    public getPublisherName(): string {
        return this.publisherName
    }
    public getPublisherLogo(): imageObject {
        return this.publisherLogo
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

