import { setup_tests, cleanup_tests } from "./setup-tests"
import { createDummyPosts } from "./sampler"
import { Documents } from "./documents.class"

describe('sampler', () => {
    beforeAll(async () => {
        await setup_tests()
    })
    afterAll(async () => {
        await cleanup_tests()
    })
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    it('should create dummy posts', async () => {
        const docs = new Documents(process.env.base + "/sampler")
        await docs.initialize()
        await createDummyPosts(docs, process.env.basedir + "/sample.html", 100)
        const found = await docs.find({})
        expect(Array.isArray(found)).toBeTruthy()
        expect(found.length).toEqual(100)
    })
})