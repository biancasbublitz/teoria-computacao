const TuringMachine = require('./src/TuringMachine')

function start () {
  const turingMachine = TuringMachine()
  const fileContent = turingMachine.readFile('entry.txt')
  const fileLines = fileContent.split('\n')

  const machineInfo = fileLines.slice(0, 4)
  const machineTransitionFunctions = fileLines.filter(line => line.includes('('))
  const machineEntry = fileLines.slice(-1)

  console.log(machineTransitionFunctions)
}

start()
