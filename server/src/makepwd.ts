import { createHash } from "node:crypto"
if(process.argv.length < 4) {
  console.log("Usage: node makepwd.js <username> <password>")
  process.exit(1)
}

const hash = createHash('sha256')
hash.update(process.argv[3])
console.log(process.argv[2] + ":" + hash.digest().toString("base64"))
