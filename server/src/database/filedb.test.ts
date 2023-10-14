import { TestEnvironment } from '../test_environment';
import { FileDB } from "./filedb.class";
import fs from 'fs'
const env = "/filedbtest"

describe('FileDB', () => {
    let te: TestEnvironment = new TestEnvironment()
    const use = "testdir"
    beforeAll(async () => {
        await te.setup()
    })
    afterAll(async () => {
        await te.teardown()
    })
    test("create and use database", async () => {
        const db = new FileDB(process.env.documents + env);
        expect(await db.createDatabase(use)).toBeTruthy()
        const test = {
            a: "barbarossa hic est",
            b: "Lorem Ipsum Sequetur",
            c: {
                e: "f"
            }
        }
        const id = (await db.create(use, test))._id
        expect(id).toBeDefined()
        const got = await db.get(use, id)
        expect(got).toBeDefined()
        expect(got.c.e).toEqual("f")
        await expect(db.get(use, id)).resolves.toBeDefined()
        await expect(db.get(use, "xyz")).rejects.toMatch("NotFound")
        const retr = await db.find(use, {})
        expect(Array.isArray(retr)).toBeTruthy()
        expect(retr).toHaveLength(1)
        const retr2 = await db.find(use, { b: "Ipsum" })
        expect(retr2).toHaveLength(1)
        expect(await db.find(use, { a: "hic" })).toHaveLength(1)
        expect(await db.find(use, { a: "Ipsum" })).toHaveLength(0)
    })

})