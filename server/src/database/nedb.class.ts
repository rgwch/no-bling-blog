import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import type { IDatabase } from './db.interface'
import Datastore from 'nedb'
import fs from 'fs'
import path from 'path'

export class NeDB implements IDatabase {
  private dbs: { [name: string]: Datastore } = {}
  private using: string = ""

  constructor(private datadir: string) { }

  private checkUsing() {
    if (!this.using.length) {
      throw new Error("no database selected")
    }
  }
  private makefile(fn: string): string {
    const ret = path.join((this.datadir || "../../data"), fn)
    return ret
  }
  use(name: string, options?: any): Datastore {
    this.using = name
    if (!this.dbs[this.using]) {
      this.dbs[this.using] = new Datastore({ filename: this.makefile(this.using), autoload: true })
    }
    return this.dbs[this.using];
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
    if (!options?.imMemory) {
      this.dbs[name] = new Datastore({ filename: this.makefile(name), autoload: true })
    } else {
      this.dbs[name] = new Datastore();
    }
    return Promise.resolve(true)
  }
  async get(_id: string, options?: any): Promise<any> {
    this.checkUsing()
    return new Promise<any>((resolve, reject) => {
      this.dbs[this.using].findOne({ '_id': _id }, (err: Error | null, result) => {
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
    this.checkUsing()
    return new Promise((resolve, reject) => {
      delete params.database
      this.dbs[this.using].find(params).sort({ created: -1 }).exec((err: Error, result: any) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  create(element: any, params?: any): Promise<any> {
    this.checkUsing()
    return new Promise((resolve, reject) => {
      this.dbs[this.using].insert(element, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }

  update(_id: string, element: any, options?: any): Promise<any> {
    this.checkUsing()
    return new Promise((resolve, reject) => {
      this.dbs[this.using].update({ _id: _id }, element, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }

  remove(_id: string, params?: any): Promise<any> {
    this.checkUsing()
    return new Promise((resolve, reject) => {
      this.dbs[this.using].remove({ _id: _id }, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }

}
