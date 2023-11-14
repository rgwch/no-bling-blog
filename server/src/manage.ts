/************************************************
 * This file is part of the NoBlingBlog project
 * Copyright (c) 2023
 * License: MIT
 ************************************************/

// Management tool for NoBlingBlog
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
import {logger} from './logger'


const ask = prompt({ sigint: true })
const docs = new Documents(process.env.documents)

console.log("NoBlingBlog Management Tool")
console.log("Environment: " + process.env.NODE_ENV)
console.log("basedir: " + process.env.basedir)
console.log("Documents: " + process.env.documents)
console.log("Users: " + process.env.users)
console.log("nedb_datadir: " + process.env.nedb_datadir)
const optionDefinitions = {
  alias: {
    config: "c"
  }

}
docs.initialize().then(() => {
  showMenu()
})

function showMenu() {

  menu([
    { hotkey: "1", title: "Build and run NoBlingBlog" },
    { hotkey: "2", title: "Create new user" },
    { hotkey: "3", title: "Show stats" },
    { hotkey: "4", title: "Backup data" },
    { hotkey: "5", title: "Show version" },
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
      case "1":
        await launch()
        break
      case "2":
        console.log("Create new user")
        createUser()
        break
      case "d":
        console.log("Create dummy posts")
        await dummies()
        break
      case "3":
        console.log("Show stats")
        stats()
        break
      case "4":
        console.log("Backup data")
        backup()
        break
      case "c":
        console.log("Cleanup, delete all data (destructive!)")
        await cleanup()
        break
      case "5":
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

async function cleanup() {
  for (let dir of [process.env.documents, process.env.nedb_datadir]) {
    remove(dir)
    fs.mkdirSync(dir, { recursive: true })
  }
  await docs.rescan()
  console.log("All data deleted.")
}

function remove(dir: string) {
  if (fs.existsSync(dir)) {
    console.log("Removing " + dir)
    fs.rmSync(dir, { recursive: true, force: true })
  } else {
    console.log("Directory " + dir + " does not exist.")
  }
}

async function dummies() {
  await createDummyPosts(docs, "../data/sample.html", 100)
  await docs.rescan()
}

function stats() {
  console.log("Number of posts: " + docs.getNumEntries())
  console.log("Number of categories: " + docs.getCategoryList().length)
  console.log("First post: " + docs.getFirstDate())
  const users = loadUsers()
  console.log("Number of users: " + users.length)
}

function backup() {
  const backupdir = process.env.backupdir || path.join(__dirname, "../backup")
  if (!fs.existsSync(backupdir)) {
    fs.mkdirSync(backupdir)
  }
  const backupfile = path.join(backupdir, "backup_" + new Date().toISOString() + ".zip")
  console.log("Creating backup " + backupfile)
  exec("zip -r " + backupfile + " " + process.env.documents + " " + process.env.index + " " + process.env.users, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.log(error)
    } else {
      console.log("Backup created.")
    }
  })
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