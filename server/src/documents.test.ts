import { Documents } from './documents.class';
import fs from 'fs/promises'
import { setup_tests, cleanup_tests } from './setup-tests'
import path from 'path'

describe('Documents', () => {
  let documents: Documents;

  beforeAll(async () => {
    await setup_tests()
  })
  afterAll(async () => {
    await cleanup_tests()
  })

  beforeEach(() => {
    documents = new Documents(process.env.documents);
  });

  it("should process a partial", async () => {
    const partial = "<div>This is a [[title]]</div>"
    await fs.writeFile(path.join(process.env.partials, "test.html"), partial)
    const post = { _id: "__test__", fulltext: `Replace the following: [[{"template":"test","title":"partial"}]] with the template` }
    const processed = await documents.processContents(post)
    expect(processed.fulltext.trim()).toEqual("<p>Replace the following: <div>This is a partial</div> with the template</p>")
  })
  it('should add a document', async () => {
    const document = { _id: "__test__", heading: 'Test Document', fulltext: 'This is a test document.' };
    await documents.add(document);
    const found=await documents.find({})
    expect(found).toContain(document);
  });

  xit('should remove a document from the list', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.' };
    documents.add(document);
    // documents.remove(document);
    // expect(documents.list).not.toContain(document);
  });

  xit('should update a document in the list', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.' };
    const updatedDocument = { _id: "1", heading: 'Updated Test Document', content: 'This is an updated test document.' };
    documents.add(document);
    //documents.update(updatedDocument);
    //expect(documents.list).toContain(updatedDocument);
    //expect(documents.list).not.toContain(document);
  });

  xit('should get a document by id', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.' };
    documents.add(document);
    // const retrievedDocument = documents.getById(1);
    // expect(retrievedDocument).toEqual(document);
  });

  xit('should return null when getting a non-existent document by id', () => {
    // const retrievedDocument = documents.getById(1);
    // expect(retrievedDocument).toBeNull();
  });
});
