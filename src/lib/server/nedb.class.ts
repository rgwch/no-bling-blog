import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import { IDatabase } from './db.interface'
import { post } from '../types'
import Datastore from 'nedb'

export class NeDB implements IDatabase {
  private dbs: { [name: string]: Datastore } = {}
  private defaultdb = "default";

  async connect(options?: any): Promise<boolean> {
    this.defaultdb = options?.default || "default"
    if (!options) {
      this.dbs[this.defaultdb] = new Datastore()
      return true;
    } else {
      this.defaultdb = options.defaultDB || "default"
      if (options.filename) {
        this.dbs[this.defaultdb] = new Datastore({ filename: options.filename, autoload: true })
        return true;
      } else {
        return false;
      }
    }
  }
  async checkInstance(): Promise<boolean> {
    return true;
  }
  async listDatabases(): Promise<string[]> {
    const ret=[]
    for(const db in this.dbs){
      ret.push(db)
    }
    return ret
  }
  async createDatabase(name: string, options?: any): Promise<boolean> {
    if(options?.filename){
      this.dbs[name]=new Datastore({filename:options.filename,autoload:true})
    }else{
      this.dbs[name]=new Datastore();
    }
    return true
  }
  async get(id: string, options?: any): Promise<any> {
    return new Promise<post>((resolve, reject) => {
      const db=options?.database||this.defaultdb
      this.dbs[db].findOne({ '_id': id }, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  find(params: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const db=options?.database||this.defaultdb
      this.db?.find(params, (err: Error, result: any) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  create(element: post, params?: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
  update(id: string, element: post): Promise<any> {
    throw new Error('Method not implemented.')
  }
  remove(id: string, params?: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

}
