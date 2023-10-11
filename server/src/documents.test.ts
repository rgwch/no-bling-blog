import { Documents } from './documents.class';
import fs from 'fs/promises'
import path from 'path'

describe('Documents', () => {
  let documents: Documents;
  const usersFile= '../data/test/users.json';
  const documentsBase= '../data/test/documents';
  const partialsBase= '../data/test/partials';
  const indexBase= '../data/test/index';
 
  beforeAll(async ()=>{
    await fs.mkdir(documentsBase, { recursive: true })
    await fs.mkdir(partialsBase, { recursive: true })
    await fs.mkdir(indexBase, { recursive: true })
    process.env.users= usersFile;
    process.env.documents= documentsBase;
    process.env.partials= partialsBase;
    process.env.index= indexBase;
    process.env.jwt_secret= 'secret';
    
  })
  afterAll(async ()=>{
    await fs.rm(documentsBase, { recursive: true })
    await fs.rm(partialsBase, { recursive: true })
    await fs.rm(indexBase, { recursive: true })
  })

  beforeEach(() => {
    documents = new Documents("../data/test/documents", "../data/test/index");
  });

  it("should process a partial", async ()=>{
    const partial="<div>This is a [[title]]</div>"
    await fs.writeFile(path.join(partialsBase,"test.html"), partial)
    const post = {_id: "__test__", fulltext: `This is a [[{"template":"test","title":"partial"}]]`}
    const processed = await documents.processContents(post)
    expect(processed.fulltext).toEqual("<div>This is a partial</div>")
  })
  xit('should add a document to the list', () => {
    const document = { _id: "__test__", heading: 'Test Document', content: 'This is a test document.'};
    documents.add(document);
    // expect(documents.list).toContain(document);
  });

  xit('should remove a document from the list', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.' };
    documents.add(document);
    // documents.remove(document);
    // expect(documents.list).not.toContain(document);
  });

  xit('should update a document in the list', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.'};
    const updatedDocument = { _id: "1", heading: 'Updated Test Document', content: 'This is an updated test document.' };
    documents.add(document);
    //documents.update(updatedDocument);
    //expect(documents.list).toContain(updatedDocument);
    //expect(documents.list).not.toContain(document);
  });

  xit('should get a document by id', () => {
    const document = { _id: "1", heading: 'Test Document', content: 'This is a test document.'};
    documents.add(document);
    // const retrievedDocument = documents.getById(1);
    // expect(retrievedDocument).toEqual(document);
  });

  xit('should return null when getting a non-existent document by id', () => {
    // const retrievedDocument = documents.getById(1);
    // expect(retrievedDocument).toBeNull();
  });
});
