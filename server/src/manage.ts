const menu = require('console-menu')
const defs = require('../package.json')

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
    { hotkey: "x", title: "Exit" }
  ], {
    header: "No-Bling-Blog Management",
    border: true
  }).then(async item => {
    console.log(String.fromCharCode(27) + "[2J")
    switch (item.hotkey) {
      case "n":
        console.log("Create new user")
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
        process.exit(0)
    }

  })
}

function showVersion() {
  console.log("NoBlingBlog v" + defs.version)
}
