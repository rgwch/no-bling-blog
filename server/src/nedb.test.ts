import { NeDB } from "./nedb.class";
import {expect, test} from "bun:test"

test("create and use database",async()=>{
  const db=new NeDB("data");
  expect(await db.createDatabase("testdb")).toBeTrue()
  const test={
    a:"b",
    b:"c",
    c:{
      e:"f"
    }
  }
  expect(()=>db.create(test)).toThrow("no database selected")
  await db.use("testdb")
  const id=(await db.create(test))._id
  expect(id).toBeDefined()
  expect(()=>db.get(id)).not.toThrow();
  expect(()=>db.get("xyz")).toThrow()
  const retr=await db.find({})
  expect(retr).toBeArray()
  expect(retr).toHaveLength(1)
  
})