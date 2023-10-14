import { FileDB } from "./filedb.class";
import fs from 'fs'

describe('FileDB', () => {
    const use="testdir"
    beforeAll(() => {
        fs.rmSync("../data/test/filedbtest", { recursive: true, force: true })
    })
    test("create and use database", async () => {
        const db = new FileDB("../data/test/filedbtest");
        expect(await db.createDatabase(use)).toBeTruthy()
        const test = {
            a: "barbarossa hic est",
            b: "Lorem Ipsum Sequetur",
            c: {
                e: "f"
            }
        }
        const id = (await db.create(use,test))._id
        expect(id).toBeDefined()
        const got = await db.get(use,id)
        expect(got).toBeDefined()
        expect(got.c.e).toEqual("f")
        // expect(() => db.get(_id)).not.toThrow();
        // expect(() => db.get("xyz")).toThrow()
        const retr = await db.find(use,{})
        // expect(retr).toBeInstanceOf(Array)
        expect(retr).toHaveLength(1)
        const retr2 = await db.find(use,{ b: "Ipsum" })
        expect(retr2).toHaveLength(1)
        expect(await db.find(use,{ a: "hic" })).toHaveLength(1)
        expect(await db.find(use,{ a: "Ipsum" })).toHaveLength(0)
    })

})