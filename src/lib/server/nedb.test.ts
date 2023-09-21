import { NeDB } from "./nedb.class";
import {expect, test} from "bun:test"

test("create inMemory db",async ()=>{
  const db=new NeDB();
  expect(await db.connect()).toBeTrue();
  expect(await db.checkInstance()).toBeTrue();
})