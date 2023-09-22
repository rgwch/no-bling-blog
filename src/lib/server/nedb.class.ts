import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import { IDatabase } from './db.interface'
import Datastore from 'nedb'
import fs from 'fs'
import path from 'path'

export class NeDB implements IDatabase {
  private dbs: { [name: string]: Datastore } = {}

  constructor(private defaultdb = "default") {

  }

  private makefile(fn:string):string{
    const ret= path.join(__dirname,process.env.nedb_dir || "data",fn)
    return ret
  }
  async connect(options?: any): Promise<boolean> {
    const db = options?.database || options?.default || this.defaultdb
    if (options?.filename) {
      this.dbs[db] = new Datastore({ filename: this.makefile(options.filename), autoload: true })
    } else {
      this.dbs[db] = new Datastore()
    }
    return true;
  }

  async checkInstance(): Promise<boolean> {
    return true;
  }
  async listDatabases(): Promise<string[]> {
    const ret = []
    for (const db in this.dbs) {
      ret.push(db)
    }
    return ret
  }
  async createDatabase(name: string, options?: any): Promise<boolean> {
    if (options?.filename) {
      this.dbs[name] = new Datastore({ filename: this.makefile(options.filename), autoload: true })
    } else {
      this.dbs[name] = new Datastore();
    }
    return true
  }
  async get(id: string, options?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const db = options?.database || this.defaultdb
      if(!this.dbs[db]){
        throw new Error("no database found:"+db)
      }
      this.dbs[db].findOne({ '_id': id }, (err, result) => {
        if (err) {
          reject(err)
        }
        if (result == null) {
          reject("NotFound")
        }
        resolve(result)
      })
    })
  }
  find(params: any): Promise<any[]> {
    return new Promise((resolve, reject) => {

      const db = params?.database || this.defaultdb
      delete params.database
      this.dbs[db].find(params, (err: Error, result: any) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  create(element: any, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = params?.database || this.defaultdb
      this.dbs[db].insert(element, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }

  update(id: string, element: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = options?.database || this.defaultdb
      this.dbs[db].update({ _id: id }, element, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }
  remove(id: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = params?.database || this.defaultdb
      this.dbs[db].remove({ _id: id }, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }

}
