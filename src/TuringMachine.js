function TuringMachine () {
  function readFile (fileName) {
    const fs = require('fs')
    const fileContent = fs.readFileSync(fileName).toString()
    return fileContent
  }

  return {
    readFile
  }
}

module.exports = TuringMachine
