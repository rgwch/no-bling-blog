
import { IDatabase } from "./db.interface";
import fs from 'fs'
import path from 'path'

export class FileDB implements IDatabase {
    private dir: string=".";
    use(database: string, options?: any): void {
        this.dir = database
        if(!fs.existsSync(this.dir)){
            fs.mkdirSync(this.dir,{recursive:true})
        }
    }
    async checkInstance(): Promise<boolean> {
        return true
    }
    async listDatabases(): Promise<string[]> {
        return [this.dir]
    }
    async createDatabase(name: string, options?: any): Promise<boolean> {
        fs.mkdirSync(name)
        return true;
    }
    get(id: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(this.dir, id), (err, cnt) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(cnt)
                }
            })
        })
    }
    find(params: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(this.dir, (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(files.filter((el) => this.doMatch(params, el)))
                }
            })
        })
    }

    private doMatch(params: any, el: string): boolean {
        try {
            const cont = fs.readFileSync(path.join(this.dir, el))
            const json = JSON.stringify(cont.toString())
            for (const attr in params) {
                const hit: string = json[attr]
                const elem: string = params[attr]
                if (hit.match(elem)) {
                    return true
                }
            }
            return false;

        } catch (err) {
            console.log(err)
            return false;
        }
    }
    create(element: any, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(this.dir, element.id), JSON.stringify(element), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(element)
                }
            })
        })
    }
    update(id: string, element: any): Promise<any> {
        element.id = id
        return this.create(element)
    }
    remove(id: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.rm(path.join(this.dir, id), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }

}