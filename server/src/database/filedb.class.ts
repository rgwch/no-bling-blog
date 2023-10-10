
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
            fs.readFile(this.makepath(id), "utf-8", (err, cnt) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(cnt))
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
                        resolve(files.map(fn => {
                            const cont = fs.readFileSync(this.makepath(fn))
                            return JSON.parse(cont.toString())
                        }))
                    } else {
                        const ret = []
                        for (const file of files) {
                            try {
                                const cont = fs.readFileSync(this.makepath(file))
                                const js = JSON.parse(cont.toString())

                                for (const attr in params) {
                                    const hit: string = js[attr]
                                    const elem: string = params[attr]
                                    if (hit.match(elem)) {
                                        ret.push(js)
                                    }
                                }
                            } catch (err) {
                                console.log(err)
                            }
                        }
                        resolve(ret)
                    }
                }
            })
        })
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
    private ok(result: any) {
        return {
            status: "ok",
            result
        }
    }
}