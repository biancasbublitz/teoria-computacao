class TuringMachine {
  readFile (fileName) {
    const fs = require('fs')
    const fileContent = fs.readFileSync(fileName).toString()
    return fileContent
  }
}

module.exports = TuringMachine
