export interface IDatabase{
  /**
   * Connect to the database driver
   * @param options implementation specific options
   * @returns true on success 
   */
    connect(options?:any):Promise<boolean>
    /**
     * Check if the database is connected and ready
     */
    checkInstance():Promise<boolean>
    /**
     * list all existing databases
     */
    listDatabases():Promise<Array<string>>
    /**
     * Create a new database
     * @param name Name for the database
     * @param options implementation specific options
     */
    createDatabase(name:string, options?:any):Promise<boolean>
    /**
     * fetch an element from the database
     * @param id unique identifier for the element
     * @returns The Element with the given id
     * @throws NotFoundException if the element doesnt exist
     */
    get(id:string,options?:any):Promise<any>
    /**
     * Find all elements matching the given criteria
     * @param params criteria to match
     * @returns a list of found elements (which can be empty)
     */
    find(params: any):Promise<Array<any>>
    /**
     * create a new element
     * @param element 
     * @param params 
     */
    create(element:any, params?:any):Promise<any>
    /**
     * Update an existing element
     * @param id id of the existing element
     * @param element new contents
     * @returns the updated element
     * @throws NotFoundException if the element does not exist
     */
    update(id:string,element:any):Promise<any>
    /**
     * remove an element from the database
     * @param id of the element to remove
     * @param params 
     * @returns the removed element or null if no such element exists
     */
    remove(id:string,params?:any):Promise<any>
}
