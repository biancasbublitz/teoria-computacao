const TuringMachine = require('./src/TuringMachine')

function start () {
  const turingMachine = TuringMachine('entry.txt')
  turingMachine.start()
}

start()
