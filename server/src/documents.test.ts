import { Documents } from './documents.class';
import { TestEnvironment } from './test_environment'

describe('Documents', () => {

  let documents: Documents;
  let te: TestEnvironment;

  beforeEach(async () => {
    te = new TestEnvironment()
    await te.setup()
    documents = new Documents(process.env.documents + "/doctest");
    await documents.initialize()
  })
  afterEach(async () => {
    await te.teardown()
  })

  it('should add a document', async () => {
    const document = { _id: "__test__", heading: 'Test Document', fulltext: 'This is a test document.' };
    await documents.add(document);
    const found = await documents.find({})
    expect(Array.isArray(found)).toBeTruthy()
    expect(found).toContainEqual(document);
  });

  it('should remove a document', async () => {
    const document = { _id: "deleteme", heading: 'Test Document do remove', fulltext: 'This is a test document.' };
    await documents.add(document);
    await documents.remove(document._id);
    const found = await documents.find({})
    expect(found).not.toContainEqual(document);
  });

  it('should update a document in the list', async () => {
    const document = { _id: "1", heading: 'Test Document', fulltext: 'This is a test document.' };
    const updatedDocument = { _id: "1", heading: 'Updated Test Document', fulltext: 'This is an updated test document.' };
    await documents.add(Object.assign({}, document));
    await documents.update(Object.assign({}, updatedDocument));
    const found = await documents.get("1", true)
    expect(found.heading).toEqual(updatedDocument.heading);
    expect(found.fulltext).toEqual(updatedDocument.fulltext);
    //expect(documents.list).not.toContain(document);
  });

  it('should get a document by id', async () => {
    const document = { _id: "1", heading: 'Test Document', fulltext: 'This is a test document.' };
    await documents.add(Object.assign({}, document));
    const retrievedDocument = await documents.get("1", true);
    expect(retrievedDocument.heading).toEqual(document.heading);
    expect(retrievedDocument.fulltext).toEqual(document.fulltext);
  });

  it('should return null when getting a non-existent document by id', async () => {
    const retrievedDocument = await documents.get("222", true);
    expect(retrievedDocument).toBeNull();
  });
});
