const TuringMachine = require('./src/TuringMachine')

function start () {
  const turingMachine = new TuringMachine()
  const fileContent = turingMachine.readFile('entry.txt')
  const fileLines = fileContent.split('\n')

  const machineInfo = fileLines.slice(0, 4)
  const machineTransitionFunctions = fileLines.slice(5, 21)
  const machineEntry = fileLines.slice(-1)

  console.log(machineEntry)
}

start()
