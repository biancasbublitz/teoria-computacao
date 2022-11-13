class TuringMachine {
  readFile (fileName) {
    const fs = require('fs')

    const fileContent = fs.readFileSync(fileName).toString()
    // const fileLines = fileContent.split('\n')

    return fileContent
  }
}

module.exports = TuringMachine
