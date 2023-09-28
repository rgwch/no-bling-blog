import fs from 'fs'


/*
parse("../../data/sample.html").then((tokens)=>{
    console.log(tokens.sort())
})
*/
export async function parse(filename: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        const words = []
        const instr = fs.createReadStream(filename)
        instr.on('data', chunk => {
            const tokens=chunk.toString().split(/[^\w]+/)
            words.push(...tokens)
        })
        instr.on('end', () => {
            const uniq=[...new Set(words.map(w=>w.toLowerCase()))]
            resolve(uniq.filter(n=>n.length>3))
        })
        instr.on('error', err => {
            reject(err)
        })
        
    })
}

