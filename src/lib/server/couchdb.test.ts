import { expect, test } from 'bun:test'
import { CouchDB } from './couchdb.class'

test.if(process.env["storage"] == "couchdb")("connect", async () => {

    try {
        const couch=new CouchDB({host:process.env.couch_host, port:process.env.couch_port,username:process.env.couch_user,password:process.env.couch_password});
        expect(()=>couch.use("testdb")).not.toThrow()
        const check = await couch.checkInstance()
        const dbs = await couch.listDatabases()
        expect(check).toBeTrue()
        expect(dbs).toBeArray();
    } catch (err) {
        console.log("fail")
    }

})

test.if(process.env["storage"] == "couchdb")("find all", async () => {
    const couch=new CouchDB({host:process.env.couch_host, port:process.env.couch_port,username:process.env.couch_user,password:process.env.couch_password});
    await couch.use("testdb")
    await couch.checkInstance()
    const all = await couch.find({})
    expect(all).toBeArray()
})

test.if(process.env.storage == "couchdb")("find by dt", async () => {
    const couch=new CouchDB({host:process.env.couch_host, port:process.env.couch_port,username:process.env.couch_user,password:process.env.couch_password});
    await couch.use("testdb")
    const all = await couch.find({ dt: "person" })
    expect(all).toBeArray()
}, 20000)
