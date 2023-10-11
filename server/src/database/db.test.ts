import { getDatabase } from './db'

xtest("construct database", async () => {
  process.env.storage = "filebased"
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
  const _id = (await db.create(test))._id
  expect(_id).toBeDefined()
  expect(() => db.get(_id)).not.toThrow();
  expect(() => db.get("xyz")).toThrow()
  const retr = await db.find({})
  expect(retr).toBeInstanceOf(Array)
  expect(retr).toHaveLength(1)

})