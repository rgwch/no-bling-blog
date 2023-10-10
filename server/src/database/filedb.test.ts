import { FileDB } from "./filedb.class";
import fs from 'fs'

beforeAll(() => {
    fs.rmSync("../data/testdir", { recursive: true, force: true })
})
test("create and use database", async () => {
    const db = new FileDB("../data");
    expect(await db.createDatabase("testdir")).toBeTruthy()
    const test = {
        a: "barbarossa hic est",
        b: "Lorem Ipsum Sequetur",
        c: {
            e: "f"
        }
    }
    // expect(() => db.create(test)).toThrow("no database selected")
    await db.use("testdir")
    const id = (await db.create(test))._id
    expect(id).toBeDefined()
    const got = await db.get(id)
    expect(got).toBeDefined()
    expect(got.c.e).toEqual("f")
    // expect(() => db.get(_id)).not.toThrow();
    // expect(() => db.get("xyz")).toThrow()
    const retr = await db.find({})
    // expect(retr).toBeInstanceOf(Array)
    expect(retr).toHaveLength(1)
    const retr2 = await db.find({ b: "Ipsum" })
    expect(retr2).toHaveLength(1)
    expect(await db.find({ a: "hic" })).toHaveLength(1)
    expect(await db.find({ a: "Ipsum" })).toHaveLength(0)
})