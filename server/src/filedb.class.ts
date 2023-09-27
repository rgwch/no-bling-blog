
import { IDatabase } from "./db.interface";
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

export class FileDB implements IDatabase {
    private basedir: string;
    private using = "";

    constructor(basedir?: string) {
        this.basedir = basedir || "data"
        if (!fs.existsSync(this.basedir)) {
            fs.mkdirSync(this.basedir, { recursive: true })
        }
    }

    private checkUsing() {
        if (!this.using) {
            throw new Error("no database selected")
        }
    }
    private makepath(name: string): string {
        this.checkUsing()
        return path.join(this.using!, name)
    }
    use(database: string, options?: any): void {
        const fullpath = path.join(this.basedir, database)
        this.using = fullpath
        if (!fs.existsSync(fullpath)) {
            fs.mkdirSync(fullpath, { recursive: true })
        }
    }
    async checkInstance(): Promise<boolean> {
        return true
    }
    async listDatabases(): Promise<string[]> {
        return [this.basedir]
    }
    async createDatabase(name: string, options?: any): Promise<boolean> {
        const fullpath = path.join(this.basedir, name)
        if (!fs.existsSync(fullpath)) {
            fs.mkdirSync(fullpath, { recursive: true })
        }
        return true;
    }
    get(id: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.makepath(id), (err, cnt) => {
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
            fs.readdir(this.using, (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    if (Object.keys(params).length == 0) {
                        resolve(files)
                    } else {
                        resolve(files.filter((el) => this.doMatch(params, el)))
                    }
                }
            })
        })
    }

    private doMatch(params: any, el: string): boolean {
        try {
            const cont = fs.readFileSync(this.makepath(el))
            const js = JSON.parse(cont.toString())
            for (const attr in params) {
                const hit: string = js[attr]
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
            if (!element._id) {
                element._id = uuid();
            }
            fs.writeFile(this.makepath(element._id), JSON.stringify(element), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(element)
                }
            })
        })
    }
    update(id: string, element: any): Promise<any> {
        element._id = id
        return this.create(element)
    }
    remove(id: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.rm(this.makepath(id), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })
    }

}