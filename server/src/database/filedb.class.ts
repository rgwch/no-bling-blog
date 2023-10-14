
import { IDatabase } from "./db.interface";
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

export class FileDB implements IDatabase {
    private basedir: string;

    constructor(basedir?: string) {
        this.basedir = basedir || "data"
        if (!fs.existsSync(this.basedir)) {
            fs.mkdirSync(this.basedir, { recursive: true })
        }
    }

    private makepath(db: string, name: string): string {
        return path.join(this.basedir, db, name)
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
    get(db: string, id: string, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.makepath(db, id), "utf-8", (err, cnt) => {
                if (err) {
                    if (options?.nullIfMissing) {
                        resolve(null)
                    } else {
                        console.log(err)
                        reject("NotFound")
                    }
                } else {
                    resolve(JSON.parse(cnt))
                }
            })
        })
    }
    find(db: string, params: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(path.join(this.basedir, db), (err, files) => {
                if (err) {
                    reject(err)
                } else {
                    if (Object.keys(params).length == 0) {
                        resolve(files.map(fn => {
                            const cont = fs.readFileSync(this.makepath(db, fn))
                            return JSON.parse(cont.toString())
                        }))
                    } else {
                        const ret = []
                        for (const file of files) {
                            try {
                                const cont = fs.readFileSync(this.makepath(db, file))
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


    create(db: string, element: any, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!element._id) {
                element._id = uuid();
            }
            fs.writeFile(this.makepath(db, element._id), JSON.stringify(element), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(element)
                }
            })
        })
    }
    update(db: string, id: string, element: any): Promise<any> {
        element._id = id
        return this.create(db, element)
    }
    remove(db: string, id: string, params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.rm(this.makepath(db, id), (err) => {
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