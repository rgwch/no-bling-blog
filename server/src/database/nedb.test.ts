import { NeDB } from "./nedb.class";
import fs from 'fs'
const use="test_nedb"

beforeAll(() => {
  fs.rmSync("../data/test/test_nedb", { force: true })
})
test("create and use database", async () => {
  const db = new NeDB("../data/test");
  // expect(await db.createDatabase("test_nedb")).toBeTruthy()
  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  // expect(() => db.create(test)).toThrow("no database selected")
  const id = (await db.create(use,test))._id
  expect(id).toBeDefined()
  // expect(() => db.get(_id)).not.toThrow();
  // expect(() => db.get("xyz")).toThrow()
  const retr = await db.find(use,{})
  expect(Array.isArray(retr)).toBeTruthy()
  expect(retr).toHaveLength(1)

})