import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import menu from 'console-menu'
import prompt from 'prompt-sync'
import { createDummyPosts } from './sampler'
import { Documents } from './documents.class'
import { Server } from './server'
const { exec } = require('child_process');


const ask = prompt({ sigint: true })
const docs = new Documents(process.env.documents, process.env.index)


const optionDefinitions = {
  alias: {
    config: "c"
  }

}

showMenu()

function showMenu() {
  
  menu([
    { hotkey: "1", title: "Launch NoBlingBlog" },
    { hotkey: "2", title: "Create new user" },
    { hotkey: "3", title: "Create dummy posts" },
    { hotkey: "4", title: "Show stats" },
    { hotkey: "5", title: "Backup data" },
    { hotkey: "6", title: "Show version" },
    { separator: true },
    { hotkey: "0", title: "Cleanup, delete all data (destructive!)" },
    { hotkey: "q", title: "Quit" }
  ], {
    header: "No-Bling-Blog Management",
    border: true
  }).then(async item => {
    console.clear()
  
    switch (item.hotkey) {
      case "1":
        await launch()
        break
      case "2":
        console.log("Create new user")
        createUser()
        break
      case "3":
        console.log("Create dummy posts")
        await dummies()
        break
      case "4":
        console.log("Show stats")
        stats()
        break
      case "5":
        console.log("Backup data")

        break
      case "0":
        console.log("Cleanup, delete all data (destructive!)")
        cleanup()
        break
      case "6":
        showVersion();
        break
      case "x":
      case "q":
        process.exit(0)
    }
    showMenu()
   
  })
}

function showVersion() {
  const defs = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
  console.log("NoBlingBlog v" + defs.version)
}

function createUser() {
  const user = ask("username? ->")
  const role = ask("role (admin,editor)? ->")
  const usersfile = path.join(__dirname, '../../data/users.json')
  let users = []
  if (fs.existsSync(usersfile)) {
    users = JSON.parse(fs.readFileSync(usersfile, 'utf8'))
  }
  users.push({ name: user, role: role })
  fs.writeFileSync(usersfile, JSON.stringify(users))
  console.log("User created.")
}

function cleanup() {
  for (let dir of [process.env.documents, process.env.nedb_datadir, process.env.index]) {
    remove(dir)
  }
  console.log("All data deleted.")
}

function remove(dir: string) {
  if (fs.existsSync(dir)) {
    console.log("Removing " + dir)
    fs.rmSync(dir, { recursive: true })
  } else {
    console.log("Directory " + dir + " does not exist.")
  }
}

function dummies() {
  createDummyPosts()
}

function stats() {
  console.log("Number of posts: " + docs.getNumEntries())
  console.log("Number of categories: " + docs.getCategoryList().length)
  console.log("First post: " + docs.getFirstDate())

}

async function launch() {
  console.log("Building client...")
  return new Promise((resolve, reject) => {
    exec("cd ../client && npm run build", (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        const server = new Server(docs)
        server.start()
        showMenu()
        resolve(true)
      }
    })
  })
 
}