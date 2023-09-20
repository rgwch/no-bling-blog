import { expect, test } from 'bun:test'
import { couch } from './couchdb.class'

test("connect", async () => {
    try {
        const connect = await couch.connect()
        const check = await couch.checkInstance()
        const dbs = await couch.listDatabases()
        expect(connect).toBeTrue()
        expect(check).toBeTrue()
        expect(dbs).toBeArray();
    } catch (err) {
        console.log("fail")
    }

})

test("find all", async () => {
    const connect = await couch.connect()
    await couch.checkInstance()
    const all = await couch.find({})
    expect(all).toBeArray()
})

test("find by dt", async () => {
    const connect = await couch.connect()
    const all = await couch.find({ dt: "person" })
    expect(all).toBeArray()
}, 20000)
