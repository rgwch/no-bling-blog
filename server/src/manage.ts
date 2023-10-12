import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import menu from 'console-menu'
import prompt from 'prompt-sync'
import { createDummyPosts } from './sampler'
import { Documents } from './documents.class'
import { Server } from './server'
import { user } from './types'
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
    { hotkey: "r", title: "Build and run NoBlingBlog" },
    { hotkey: "u", title: "Create new user" },
    { hotkey: "s", title: "Show stats" },
    { hotkey: "b", title: "Backup data" },
    { hotkey: "v", title: "Show version" },
    { separator: true },
    { hotkey: "d", title: "Create dummy posts" },
    { hotkey: "c", title: "Cleanup, delete all data (destructive!)" },
    { hotkey: "q", title: "Quit" }
  ], {
    header: "No-Bling-Blog Management",
    border: true
  }).then(async item => {
    console.clear()

    switch (item.hotkey) {
      case "r":
        await launch()
        break
      case "u":
        console.log("Create new user")
        createUser()
        break
      case "d":
        console.log("Create dummy posts")
        await dummies()
        break
      case "s":
        console.log("Show stats")
        stats()
        break
      case "b":
        console.log("Backup data")

        break
      case "c":
        console.log("Cleanup, delete all data (destructive!)")
        cleanup()
        break
      case "v":
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
  const users = loadUsers()
  const user = ask("username? ->")
  if (users.find(u => u.name == user)) {
    console.log("User already exists.")
  } else {
    const role = ask("role (admin,editor)? ->")
    users.push({ name: user, role: role })
    fs.writeFileSync(process.env.users, JSON.stringify(users))
    console.log("User created.")
  }
}

function loadUsers(): Array<user> {
  let users = []
  if (fs.existsSync(process.env.users)) {
    users = JSON.parse(fs.readFileSync(process.env.users, 'utf8'))
  }
  return users
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

async function dummies() {
  await createDummyPosts(docs)
  await docs.rescan()
}

function stats() {
  console.log("Number of posts: " + docs.getNumEntries())
  console.log("Number of categories: " + docs.getCategoryList().length)
  console.log("First post: " + docs.getFirstDate())
  const users=loadUsers()
  console.log("Number of users: " + users.length)
}

function launch() {
  console.log("Building client...")
  return new Promise((resolve, reject) => {
    exec("cd ../client && npm run build", (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        const server = new Server(docs)
        server.start().then(() => {
          console.log("NoBlingBlog started. Select 'quit' to stop.")
          resolve(true)
        })
      }
    })
  })

}