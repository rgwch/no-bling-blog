import { createHash } from "node:crypto"
const hash = createHash('sha256')
hash.update(process.argv[2])
console.log(process.argv[2] + ":" + hash.digest().toString("base64"))