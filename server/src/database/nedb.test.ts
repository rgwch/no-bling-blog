import { NeDB } from "./nedb.class";
import fs from 'fs'

beforeAll(()=>{
  fs.rmSync("../data/test_nedb",{force:true})
})
test("create and use database", async () => {
  const db = new NeDB("../data");
  // expect(await db.createDatabase("test_nedb")).toBeTruthy()
  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  // expect(() => db.create(test)).toThrow("no database selected")
  await db.use("test_nedb")
  const id = (await db.create(test))._id
  expect(id).toBeDefined()
  // expect(() => db.get(_id)).not.toThrow();
  // expect(() => db.get("xyz")).toThrow()
  const retr = await db.find({})
  expect(Array.isArray(retr)).toBeTruthy()
  expect(retr).toHaveLength(1)

})