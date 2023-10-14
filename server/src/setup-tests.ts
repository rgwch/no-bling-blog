const base = "../data/test"
const usersFile = '../data/test/users.json';
const documentsBase = '../data/test/documents';
const partialsBase = '../data/test/partials';
const indexBase = '../data/test/index';
import fs from 'fs/promises'

export class TestEnvironment {

}
export async function setup_tests() {
    await fs.mkdir(documentsBase, { recursive: true })
    await fs.mkdir(partialsBase, { recursive: true })
    await fs.mkdir(indexBase, { recursive: true })
    process.env.storage = "nedb";
    process.env.users = usersFile;
    process.env.documents = documentsBase;
    process.env.partials = partialsBase;
    process.env.index = indexBase;
    process.env.jwt_secret = 'secret';
    process.env.nedb_datadir = base

}

export async function cleanup_tests() {
    await fs.rm(documentsBase, { recursive: true })
    await fs.rm(partialsBase, { recursive: true })
    await fs.rm(indexBase, { recursive: true })
}
