import { TestEnvironment } from './../test_environment';
import { NeDB } from "./nedb.class";
import fs from 'fs'
const use = "test_nedb"

describe("nedb", () => {
  let te: TestEnvironment = new TestEnvironment()
  beforeAll(() => {
    // fs.rmSync("../data/test/test_nedb", { force: true })
    te.setup()
  })
  afterAll(async () => {
    await te.teardown()
  })

  test("create and use database", async () => {
    const db = new NeDB(process.env.nedb_datadir);
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

  test("insert the same index twice", async () => {
    const db = new NeDB(process.env.nedb_datadir);
    await db.createDatabase(use)
    const test = {
      _id: "id",
      a: "b",
      b: "c",
      c: {
        e: "f"
      }
    }
    await db.create(use, test)
    try {
      await db.create(use, test)

    } catch (err:any) {
      expect(err.message).toMatch("unique")
    }

  })
})