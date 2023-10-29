export type post = {
    _id: string
    heading?: string
    teaser?: string
    fulltext?: string
    keywords?: string
    category?: string
    author?: string
    created?: Date
    modified?: Date
    published?: boolean
    filename?: string,
    reference?: any
    featured?: boolean
}
export type user = {
    name: string
    role: string
    label?: string
    pass?: string
}