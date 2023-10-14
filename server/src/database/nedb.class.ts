import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import type { IDatabase } from './db.interface'
import Datastore from 'nedb'
import fs from 'fs'
import path from 'path'

export class NeDB implements IDatabase {
  private dbs: { [name: string]: Datastore } = {}

  constructor(private datadir: string) { }

  private makefile(fn: string): string {
    const ret = path.join((this.datadir || "../../data"), fn)
    return ret
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
  createDatabase(name: string, options?: any): Promise<boolean> {
    if (!options?.inMemory) {
      this.dbs[name] = new Datastore({ filename: this.makefile(name), autoload: true })
    } else {
      this.dbs[name] = new Datastore();
    }
    return Promise.resolve(true)
  }
  async get(db: string, _id: string, options?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dbs[db].findOne({ '_id': _id }, (err: Error | null, result) => {
        if (err) {
          reject(err)
        }
        if (result == null) {
          if (options?.nullIfMissing) {
            resolve(null)
          } else
            reject("NotFound")
        }
        resolve(result)
      })
    })
  }
  find(db: string, params: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.dbs[db].find(params).sort({ created: -1 }).exec((err: Error, result: any) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  create(db: string, element: any, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbs[db].insert(element, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }

  update(db: string, _id: string, element: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbs[db].update({ _id: _id }, element, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }

  remove(db: string, _id: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbs[db].remove({ _id: _id }, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }

}
