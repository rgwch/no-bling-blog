import {NeDB} from "./nedb.class";
import { IDatabase } from "./db.interface";
import { CouchDB } from "./couchdb.class";

export class Db implements IDatabase {

  private db: IDatabase;
  constructor() {
    switch (process.env.storage) {
      case "nedb":
        console.log("NeDB")
        this.db=new NeDB("nbb")
        break;
      case "couchdb":
        console.log("CouchDB")
        this.db=new CouchDB({host:process.env.couch_host,port:process.env.couch_port})
        break;
      default:
        throw new Error("No Datastore defined in .env")
    }
  }

  connect(options?: any): Promise<boolean> {
    return this.db.connect(options)
  }
  checkInstance(): Promise<boolean> {
    return this.db.checkInstance();
  }
  listDatabases(): Promise<string[]> {
    return this.db.listDatabases()
  }
  createDatabase(name: string, options?: any): Promise<boolean> {
    return this.db.createDatabase(name,options)
  }
  get(id: string, options?: any): Promise<any> {
   return this.db.get(id,options)
  }
  find(params: any): Promise<any[]> {
    return this.db.find(params)
  }
  create(element: any, params?: any): Promise<any> {
    return this.db.create(element,params)
  }
  update(id: string, element: any): Promise<any> {
    return this.db.update(id,element)
  }
  remove(id: string, params?: any): Promise<any> {
    return this.db.remove(id,params)
  }

}