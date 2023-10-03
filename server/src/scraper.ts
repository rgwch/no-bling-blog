import fs from 'fs/promises'
export class Scraper{
    async fetch(url:string):Promise<string>{
        const response=await fetch(url)
        if(response.ok){
            const html=await response.text()
            return html
        }
        return ""
    }

    async scrape(url:string){
        
    }
}