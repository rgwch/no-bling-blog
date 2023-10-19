import { TestEnvironment } from './test_environment';
import { createDummyPosts } from "./sampler"
import { Documents } from "./documents.class"

describe('sampler', () => {
    let te: TestEnvironment = new TestEnvironment()
    beforeAll(async () => {
        await te.setup()
    })
    afterAll(async () => {
        await te.teardown()
    })

    it('should create dummy posts', async () => {
        const docs = new Documents(process.env.documents + "/sampler")
        await docs.initialize()
        await createDummyPosts(docs, process.env.basedir + "/sample.html", 10)
        const found = await docs.find({})
        expect(Array.isArray(found)).toBeTruthy()
        expect(found.length).toEqual(10)
    })
})