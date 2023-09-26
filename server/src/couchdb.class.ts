import { logger } from './logger'
import { v4 as uuid } from 'uuid'
import { IDatabase } from './db.interface'

export class CouchDB implements IDatabase {
  private using: string = "default"
  private url
  private auth: string = ""
  constructor(private options: any) {
    this.url = `http://${options.host}:${options.port}/`
  }

  private checkUsing() {
    if (!this.using) {
      throw new Error("no database selected");
    }
  }
  public async use(name: string, params?: any): Promise<boolean> {
    this.using = name;
    this.checkUsing()
    const options = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "name": this.options.username,
        "password": this.options.password
      })
    }
    const result = await fetch(this.url + "_session", options)
    if (!result.ok) {
      return false;
    }
    const val = await result.json()
    result.headers.forEach((v, k) => {
      if (k == "set-cookie") {
        this.auth = v;
      }
    })

    return true;
  }
  private async request(addr: string, method: "get" | "put" | "post" | "delete" = "get", body?: any): Promise<any> {
    this.checkUsing()
    const options: any = {
      method,
      headers: this.makeHeaders()
    }
    if (body) {
      options.body = JSON.stringify(body)
    }
    const result = await fetch(this.url + this.using + "/" + addr, options)
    return await result.json()
  }

  private makeHeaders() {
    return {
      "Content-type": "application/json",
      Cookie: this.auth

    }
  }
  async checkInstance(): Promise<boolean> {
    try {
      const headers = this.makeHeaders()
      const data = await fetch(this.url, { method: "GET", headers })
      if (data) {
        if (data.status === 401) {
          logger.error("Not authorized for CouchDB, Please check username/password")
          return false;
        }
        logger.info("Connected with CouchDB " + (await data.json()).version)
        const dbs = await this.listDatabases()
        const db = this.options.defaultDB
        if (db && !dbs.includes(db)) {
          await this.createDatabase(db)
        }
        logger.info("Databases: " + JSON.stringify(await this.listDatabases()))
        return true
      } else {
        logger.error("No data from CouchDB")
        return false;
      }
    } catch (err) {
      logger.error("Could not connect with CouchDB: " + err)
      return false
    }
  }

  async listDatabases(): Promise<Array<string>> {
    const headers = this.makeHeaders()
    const result = await fetch(this.url + "_all_dbs", { method: "GET", headers })
    if (result.ok) {
      const dbs = await result.json()
      return dbs
    } else {
      const explain = await result.json()
      throw new Error("CouchDB List databases: " + JSON.stringify(result) + ", " + JSON.stringify(explain));
    }
  }

  async createDatabase(dbname: string): Promise<boolean> {
    try {
      const headers = this.makeHeaders()
      const result = await fetch(this.url + dbname, { method: "put", headers })
      if (result.ok) {
        return true
      } else {
        logger.error(JSON.stringify(result))
        return false;
      }
    } catch (err) {
      logger.error("CouchDB create DB: " + err)
      return false
    }
  }

  /**
   * Retrieve an object by its id
   * @param id id of the object to find
   * @param implementation specific 
   * @returns the object
   * @throws "not_found" if no object with the given id exists
   */
  async get(id: string, params?: any): Promise<any> {
    const result = await this.request(id)
    if (result.error) {
      throw new Error(result.error)
    }
    return result
  }
  async find(params: any): Promise<any> {
    const result = await this.request("_find", "post", { selector: params })
    if (result.error) {
      throw new Error(result.error)
    }
    return result.docs
  }
  /**
   * create a new entry. If object woth the same obj.id exists,throw error.
   * @param obj The object to store
   * @returns the newly created object
   */
  async create(obj: any, params?: any): Promise<any> {
    this.checkUsing()
    const dbs: Array<string> = await this.listDatabases()
    if (!dbs.includes(this.using)) {
      const ndb = await this.createDatabase(this.using)
    }
    if (!obj._id) {
      obj._id = obj.id || uuid()
    }
    const result = await this.request(obj._id, "put", obj)
    if (result.error) {
      logger.warn(result.error)
      throw new Error(result.error)
    } else {
      return obj
    }

  }
  /**
   * Update existing object. If no object with the given ID exists:
   * create new entry, if params.query.upsert is true, throw not_found otherwise.
   *
   * @param id id of the object to update
   * @param data the object
   * @param params,database, params params.upsert,
   * @returns the updated or newly created object
   */
  async update(id: string, data: any, params?: any) {
    try {
      const obj = await this.get(id, params)
      data._rev = obj._rev
      const result = await this.request(id + "?rev=" + obj._rev, "put", data)
      if (result.error) {
        logger.error("CouchDB update: " + JSON.stringify(result))
        throw new Error(result.reason)
      } else {
        data._rev = result.rev
        return data
      }
    } catch (err: any) {
      if (err.message === "not_found") {
        if (params?.upsert) {
          const result = await this.create(data, params)
          return result
        } else {
          throw new Error("not_found")
        }
      }
    }
  }

  /**
   * Remove an object by its id or delete a database
   * @param id id of the object to remove. If id is "!database!": Delete the database in params.query.database
   * @param params params.query.database: Database where the object is located
   * @returns the newly deleted object
   */
  async remove(id: string, params?: any): Promise<any> {
    if (id !== "!database!") {
      // delete document
      const obj = await this.get(id, params)
      const result = await this.request(id + "?rev=" + obj._rev, "delete")
      if (result.ok) {
        return obj
      } else {
        logger.error("Couch delete: " + JSON.stringify(result))
        return undefined
      }
    } else {
      // delete database
      const result = await fetch(this.url + "/" + this.using, { method: "delete" })
      const ans = await result.json()
      return ans
    }
  }

}
