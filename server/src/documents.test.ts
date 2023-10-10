import { Documents } from './documents.class';

describe('Documents', () => {
  let documents: Documents;

  beforeAll(()=>{
    process.env.users= '../data/test/users.json';
    process.env.documents= '../data/test/documents';
    process.env.partials= '../data/test/partials';
    process.env.index= '../data/test/index';
    process.env.jwt_secret= 'secret';
  })
  beforeEach(() => {
    documents = new Documents("../data/test/documents", "../data/test/index");
  });

  it('should add a document to the list', () => {
    const document = { _id: "__test__", title: 'Test Document', content: 'This is a test document.',heading: "TheHeadline" };
    documents.add(document);
    expect(documents.list).toContain(document);
  });

  it('should remove a document from the list', () => {
    const document = { id: 1, title: 'Test Document', content: 'This is a test document.' };
    documents.add(document);
    documents.remove(document);
    expect(documents.list).not.toContain(document);
  });

  it('should update a document in the list', () => {
    const document = { id: 1, title: 'Test Document', content: 'This is a test document.' };
    const updatedDocument = { id: 1, title: 'Updated Test Document', content: 'This is an updated test document.' };
    documents.add(document);
    documents.update(updatedDocument);
    expect(documents.list).toContain(updatedDocument);
    expect(documents.list).not.toContain(document);
  });

  it('should get a document by id', () => {
    const document = { id: 1, title: 'Test Document', content: 'This is a test document.' };
    documents.add(document);
    const retrievedDocument = documents.getById(1);
    expect(retrievedDocument).toEqual(document);
  });

  it('should return null when getting a non-existent document by id', () => {
    const retrievedDocument = documents.getById(1);
    expect(retrievedDocument).toBeNull();
  });
});
