import { IDatabase } from './db.interface';
import { getDatabase } from "./db";
import * as solr from 'solr-client'

export type SolrOptions = {
    host: string
    port: string
    core: string
    path: "/solr"
}

export class SolrDB implements IDatabase {
    private db?: solr.Client

    constructor(private options: SolrOptions) { }


    use(database: string, options?: any): void {
        this.options.core = database
        this.db = solr.createClient(this.options)
    }
    checkInstance(): Promise<boolean> {
        return Promise.resolve(!!this.db)
    }
    listDatabases(): Promise<string[]> {
        return Promise.resolve([this.options.core])
    }
    createDatabase(name: string, options?: any): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    get(id: string, options?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    find(params: any): Promise<any[]> {
        throw new Error('Method not implemented.');
    }
    create(element: any, params?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    update(id: string, element: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    remove(id: string, params?: any): Promise<any> {
        throw new Error('Method not implemented.');
    }

}