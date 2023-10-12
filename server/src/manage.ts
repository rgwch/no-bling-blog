import fs from 'fs'
import path from 'path'
import menu from 'console-menu'
import prompt from 'prompt-sync'
const ask = prompt({ sigint: true })

const optionDefinitions = {
  alias: {
    config: "c"
  }

}

showMenu()

function showMenu() {
  menu([
    { hotkey: "n", title: "Create new user" },
    { hotkey: "d", title: "Create dummy posts" },
    { hotkey: "s", title: "Show stats" },
    { hotkey: "b", title: "Backup data" },
    { hotkey: "v", title: "Show version" },
    { separator: true },
    { hotkey: "c", title: "Cleanup, delete all data (destructive!)" },
    { hotkey: "q", title: "Quit" }
  ], {
    header: "No-Bling-Blog Management",
    border: true
  }).then(async item => {
    console.clear()
    switch (item.hotkey) {
      case "n":
        console.log("Create new user")
        createUser()
        break
      case "d":
        console.log("Create dummy posts")
        break
      case "s":
        console.log("Show stats")
        break
      case "b":
        console.log("Backup data")
        break
      case "c":
        console.log("Cleanup, delete all data (destructive!)")
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