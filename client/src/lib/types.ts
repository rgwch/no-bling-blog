/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

export type post = {
    _id?: string
    heading: string
    teaser: string
    fulltext: string
    keywords?: string
    category: string
    author: string
    created?: Date
    modified?: Date
    published: boolean
    filename?: string
    featured?: boolean
    priority?: number
}

