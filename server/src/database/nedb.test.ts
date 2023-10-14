import { NeDB } from "./nedb.class";
import fs from 'fs'
const use = "test_nedb"

beforeAll(() => {
  fs.rmSync("../data/test/test_nedb", { force: true })
})
test("create and use database", async () => {
  const db = new NeDB("../data/test");
  expect(await db.createDatabase(use)).toBeTruthy()
  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  const id = (await db.create(use, test))._id
  expect(id).toBeDefined()
  await expect(db.get(use, "a")).rejects.toMatch("NotFound")
  await expect(db.get(use, "a", { nullIfMissing: true })).resolves.toBeNull()
  await expect(db.get(use, id)).resolves.toBeDefined()
  const retr = await db.find(use, {})
  expect(Array.isArray(retr)).toBeTruthy()
  expect(retr).toHaveLength(1)

})