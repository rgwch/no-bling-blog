import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import type { IDatabase } from './db.interface'
import Datastore from 'nedb'
import fs from 'fs'
import path from 'path'

export class NeDB implements IDatabase {
  private dbs: { [name: string]: Datastore } = {}
  private using:string=""

  constructor(private datadir:string) {}

  private checkUsing(){
    if(!this.using.length){
      throw new Error("no database selected")
    }
  }
  private makefile(fn:string):string{
    const ret= path.join(this.datadir || "data",fn)
    return ret
  }
  async use(name: string, options?: any): Promise<boolean> {
    this.using=name
    if (options?.filename) {
      this.dbs[this.using] = new Datastore({ filename: this.makefile(this.using), autoload: true })
    } else {
      this.dbs[this.using] = new Datastore()
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
    if (!options?.imMemory) {
      this.dbs[name] = new Datastore({ filename: this.makefile(name), autoload: true })
    } else {
      this.dbs[name] = new Datastore();
    }
    return true
  }
  async get(id: string, options?: any): Promise<any> {
    this.checkUsing()
    return new Promise<any>((resolve, reject) => {
      this.dbs[this.using].findOne({ '_id': id }, (err, result) => {
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
      this.dbs[this.using].find(params, (err: Error, result: any) => {
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

  update(id: string, element: any, options?: any): Promise<any> {
    this.checkUsing()
    return new Promise((resolve, reject) => {
      this.dbs[this.using].update({ _id: id }, element, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    });
  }
  remove(id: string, params?: any): Promise<any> {
    this.checkUsing()
    return new Promise((resolve, reject) => {
      this.dbs[this.using].remove({ _id: id }, {}, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }

}
