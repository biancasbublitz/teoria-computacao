const TuringMachine = require('./src/TuringMachine')

function start () {
  const turingMachine = new TuringMachine()
  const fileContent = turingMachine.readFile('entry.txt')

  console.log(fileContent)
}

start()
