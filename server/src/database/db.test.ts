import { TestEnvironment } from './../test_environment';
import { getDatabase } from './db'

const env = "/dbtest"

xdescribe("db", () => {
  let te: TestEnvironment = new TestEnvironment()
  beforeAll(async () => {
    await te.setup()
    process.env.storage = "filebased"
    process.env.filebased_basedir = process.env.documents + env
  })

  afterAll(async () => {
    // cleanup_tests()
  })
  test("construct database", async () => {
    let db = getDatabase()
    const use = "testdb"
    expect(db).toBeDefined()
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
})