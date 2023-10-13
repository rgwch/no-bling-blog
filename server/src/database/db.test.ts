import { getDatabase } from './db'

test("construct database", async () => {
  process.env.storage = "filebased"
  process.env.filebased_basedir = "../data/test/dbtest"
  let db = getDatabase()
  const use="testdb"
  expect(db).toBeDefined()

  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  const _id = (await db.create(use,test))._id
  expect(_id).toBeDefined()
  expect(() => db.get(use,_id)).not.toThrow();
  expect(() => db.get(use,"xyz")).toThrow()
  const retr = await db.find(use,{})
  expect(retr).toBeInstanceOf(Array)
  expect(retr).toHaveLength(1)

})