import { setup_tests, cleanup_tests } from "./setup-tests"
import { createDummyPosts } from "./sampler"

describe('sampler', () => {
    beforeAll(async () => {
        await setup_tests()
    })
    afterAll(async () => {
        await cleanup_tests()
    })

    it('should create dummy posts', () => {
        createDummyPosts
    })
})