import { NeDB } from "./nedb.class";
import {expect, test} from "bun:test"

test("create inMemory db",async ()=>{
  const db=new NeDB();
  expect(await db.connect()).toBeTrue();
  expect(await db.checkInstance()).toBeTrue();
})

test("create and use database",async()=>{
  const db=new NeDB("testdb");
  expect(await db.createDatabase("testdb")).toBeTrue();
  const test={
    a:"b",
    b:"c",
    c:{
      e:"f"
    }
  }
  expect(await db.create(test)).toHaveProperty("_id")
})