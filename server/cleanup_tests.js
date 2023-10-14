const fs = require('fs')

const teardown = () => {
    fs.rmSync("../data/test", { recursive: true })
}
module.exports = teardown;
