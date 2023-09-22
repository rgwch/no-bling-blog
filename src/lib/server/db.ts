import {NeDB} from "./nedb.class";
import { IDatabase } from "./db.interface";
import { CouchDB } from "./couchdb.class";

export const getDatabase=():IDatabase=>{
 
  switch (process.env.storage) {
      case "nedb":
        console.log("NeDB")
        return new NeDB("nbb")
        break;
      case "couchdb":
        console.log("CouchDB")
        return new CouchDB({host:process.env.couch_host,port:process.env.couch_port})
        break;
      default:
        throw new Error("No Datastore defined in .env")
    }
  
}
