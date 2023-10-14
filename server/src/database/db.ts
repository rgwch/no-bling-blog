import { NeDB } from "./nedb.class";
import type { IDatabase } from "./db.interface";
import { CouchDB } from "./couchdb.class";
import { FileDB } from "./filedb.class";
import {logger} from "../logger"

let db: IDatabase
export const getDatabase = (): IDatabase => {
  const storage=process.env.storage ?? "filebased"
  if (!db) {
    switch (storage) {
      case "nedb":
        logger.debug("NeDB")
        db = new NeDB(process.env.nedb_datadir || "../data")
        break;
      case "couchdb":
        logger.debug("CouchDB")
        db = new CouchDB({ host: process.env.couch_host, port: process.env.couch_port, username: process.env.couch_user, password: process.env.couch_password })
        break;
      case "filebased":
        logger.debug("fileDB")
        db = new FileDB(process.env.filebased_basedir || "../data")
        break;
      default:
        throw new Error("No valid datastore defined in .env")
    }
  }
  return db

}
