import {getDatabase} from './db'
import {expect, test} from "bun:test"

test("construct database",async ()=>{
    const database="ndd"
    process.env.storage="nedb"
    let db=getDatabase()
    expect(db).toBeDefined()
    expect(await db.connect({database,filename:"testdb.dat"})).toBeTrue()
    const test={
        a:"b",
        b:"c",
        c:{
          e:"f"
        }
      }
      const id=(await db.create(test,{database}))._id
      expect(id).toBeDefined()
      expect(()=>db.get(id,{database})).not.toThrow();
      expect(()=>db.get("xyz")).toThrow()
      const retr=await db.find({database})
      expect(retr).toBeArray()
      expect(retr).toHaveLength(1)
     
})