import { getDatabase } from './db'
import { expect, test } from "bun:test"

test("construct database", async () => {
  process.env.storage = "nedb"
  let db = getDatabase()
  expect(db).toBeDefined()

  await db.use("testdb", { createIfNotExists: true })
  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  const id = (await db.create(test))._id
  expect(id).toBeDefined()
  expect(() => db.get(id)).not.toThrow();
  expect(() => db.get("xyz")).toThrow()
  const retr = await db.find({})
  expect(retr).toBeArray()
  expect(retr).toHaveLength(1)

})