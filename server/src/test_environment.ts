import "dotenv/config"
import { randomBytes } from 'crypto';
const base = "../data/test"
const usersFile = '../data/test/users.json';

import fs from 'fs/promises'
import path from 'path'


export class TestEnvironment {
    private testDir: string;
    private documentsBase: string;
    private partialsBase: string
    private indexBase: string

    constructor() {
        const dirname = `test-${randomBytes(8).toString('hex')}`;
        this.testDir = path.join(base, dirname)
        this.documentsBase = path.join(this.testDir, "documents")
        this.partialsBase = path.join(this.testDir, 'partials');
        this.indexBase = path.join(this.testDir, 'index');
    }
    public async setup() {
        process.env.base = base
        process.env.storage = "nedb";
        process.env.users = usersFile;
        process.env.documents = this.documentsBase;
        process.env.partials = this.partialsBase;
        process.env.jwt_secret = 'secret';
        process.env.nedb_datadir = this.documentsBase
        process.env.index = this.indexBase;
        await fs.mkdir(this.documentsBase, { recursive: true })
        await fs.mkdir(this.partialsBase, { recursive: true })
        await fs.mkdir(this.indexBase, { recursive: true })

    }
    public async teardown() {
        await fs.rm(this.testDir, { recursive: true, force: true })
    }
}
