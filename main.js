const TuringMachine = require('./src/TuringMachine')

function start () {
  const receivedEntryFile = process.argv.length === 3

  if (!receivedEntryFile) {
    return console.log('Entry file not found')
  }

  const [, , entryFile] = process.argv

  const turingMachine = TuringMachine(entryFile)
  turingMachine.start()
}

start()
