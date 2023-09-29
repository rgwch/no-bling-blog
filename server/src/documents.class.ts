import { parseString } from "./parser";
import fs from 'fs/promises'
import path from 'path'
import {post} from './types'
export class Documents {

    constructor(private basedir: string, private indexdir: string) {
        try {
            fs.mkdir(basedir, { recursive: true })
        } catch (err) {

        }
        try {
            fs.mkdir(indexdir, { recursive: true })
        }catch(err){

        }
    }

    public async addDocument(id: string, contents: string, title: string) {
        const parsed = await parseString(contents, title)
        for (const token of parsed.tokens) {
            let cont = ""
            try {
                cont = await fs.readFile(path.join(this.indexdir, token), "utf-8")
            } catch (err) {
                // not found
            }
            cont += id + "\n"
            await fs.writeFile(path.join(this.indexdir, token), cont)
        }
        return parsed
    }

    public async filter(posts:Array<post>, criteria:string):Promise<Array<post>>{
        const ret:Array<post>=[]
        const ids:Array<string>=[]
        const files=await fs.readdir(this.indexdir)
        for(const file of files){
            if(file.match(criteria)){
                const kw=await fs.readFile(path.join(this.indexdir,file),"utf-8")
                const id=kw.split(/\n/)
                ids.push(...id)
            }
        }
        for(const post of posts){
            for(const id of ids.filter(i=>i.length>0)){
                if(id===post._id){
                    ret.push(post)
                    break;
                }
            }
        }
        return ret
    }
}