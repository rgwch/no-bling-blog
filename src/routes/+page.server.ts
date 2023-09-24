import {getDatabase} from '$lib/server/db'
export async function load({ params }) {
  const db=await getDatabase()
	await db.createDatabase("nbb")
	db.use("nbb")
  const results=db.find({})
	return {
		results
	};
}