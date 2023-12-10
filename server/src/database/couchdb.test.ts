import { CouchDB } from './couchdb.class'

xdescribe("couchdb", () => {
    test("dummy", () => {
        expect(1 + 1).toBe(2)
    })
    if (process.env["storage"] == "couchdb") {
        test("connect", async () => {

            try {
                const couch = new CouchDB({ host: process.env.couch_host, port: process.env.couch_port, username: process.env.couch_user, password: process.env.couch_password });
                expect(() => couch.use("testdb")).not.toThrow()
                const check = await couch.checkInstance()
                const dbs = await couch.listDatabases()
                expect(check).toBeTruthy()
                expect(dbs).toBeInstanceOf(Array)
            } catch (err) {
                console.log("fail")
            }

        })


        test("find all", async () => {
            const couch = new CouchDB({ host: process.env.couch_host, port: process.env.couch_port, username: process.env.couch_user, password: process.env.couch_password });
            await couch.use("testdb")
            await couch.checkInstance()
            const all = await couch.find({})
            expect(all).toBeInstanceOf(Array)
        })

        test("find by dt", async () => {
            const couch = new CouchDB({ host: process.env.couch_host, port: process.env.couch_port, username: process.env.couch_user, password: process.env.couch_password });
            await couch.use("testdb")
            const all = await couch.find({ dt: "person" })
            expect(all).toBeInstanceOf(Array)
        }, 20000)

    }
})