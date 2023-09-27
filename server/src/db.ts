import { NeDB } from "./nedb.class";
import type { IDatabase } from "./db.interface";
import { CouchDB } from "./couchdb.class";
import { FileDB } from "./filedb.class";

let db: IDatabase
export const getDatabase = (): IDatabase => {

  if (!db) {
    switch (process.env.storage) {
      case "nedb":
        console.log("NeDB")
        db = new NeDB(process.env.nedb_datadir || "../data")
        break;
      case "couchdb":
        console.log("CouchDB")
        db = new CouchDB({ host: process.env.couch_host, port: process.env.couch_port, username: process.env.couch_user, password: process.env.couch_password })
        break;
      case "filebased":
        console.log("fileDB")
        db = new FileDB("../data")
      default:
        throw new Error("No Datastore defined in .env")
    }
  }
  return db

}
