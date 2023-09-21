import { logger } from '../logger'
import { v4 as uuid } from 'uuid'
import { IDatabase } from './db.interface'
import { post } from '../types'
import Datastore from 'nedb'

export class NeDB implements IDatabase<post>{
  private db: Datastore | null = null
  async connect(options: any): Promise<boolean> {
    if (!options) {
      this.db = new Datastore()
      return true;
    } else {
      if (options.filename) {
        this.db = new Datastore({ filename: options.filename, autoload: true })
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
    throw new Error('Method not implemented.')
  }
  async createDatabase(name: string, options?: any): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  async get(id: string, options?: any): Promise<post> {
    return new Promise<post>((resolve, reject) => {
      this.db?.findOne({ '_id': id }, (err, result) => {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  }
  find(params: any): Promise<post[]> {
    throw new Error('Method not implemented.')
  }
  create(element: post, params?: any): Promise<post> {
    throw new Error('Method not implemented.')
  }
  update(id: string, element: post): Promise<post> {
    throw new Error('Method not implemented.')
  }
  remove(id: string, params?: any): Promise<post> {
    throw new Error('Method not implemented.')
  }

}
