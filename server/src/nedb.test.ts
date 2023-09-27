import { NeDB } from "./nedb.class";

xtest("create and use database", async () => {
  const db = new NeDB("data");
  expect(await db.createDatabase("testdb")).toBeTruthy()
  const test = {
    a: "b",
    b: "c",
    c: {
      e: "f"
    }
  }
  expect(() => db.create(test)).toThrow("no database selected")
  await db.use("testdb")
  const _id = (await db.create(test))._id
  expect(_id).toBeDefined()
  expect(() => db.get(_id)).not.toThrow();
  expect(() => db.get("xyz")).toThrow()
  const retr = await db.find({})
  expect(retr).toBeInstanceOf(Array)
  expect(retr).toHaveLength(1)

})