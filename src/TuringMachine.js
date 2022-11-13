const fs = require('fs')

function TuringMachine () {
  const machineHead = {
    currentState: '0',
    currentPosition: 0
  }

  const fileContent = fs.readFileSync('entry.txt').toString()
  const fileLines = fileContent.split('\n')

  const [machineInfo, availableStates, entryAlphabet, machineAlphabet] = fileLines.slice(0, 4)
  const machineEntry = fileLines.slice(-1).toString().split('')

  function start () {
    machineHead.currentState = availableStates.split(' ')[0]

    const machineEntryIsValid = checkEntryAlphabet()

    if (!machineEntryIsValid) {
      return console.log('Invalid entry')
    }

    machineEntry.push(machineAlphabet.at(-1))

    readTransitionFunctions()
  }

  function checkEntryAlphabet () {
    const filtered = machineEntry.filter(character => {
      return entryAlphabet.includes(character)
    })

    return filtered.length === machineEntry.length
  }

  function readTransitionFunctions () {
    const machineTransitionFunctions = fileLines.filter(line => line.includes('('))

    for (let i = 0; i < Number(machineInfo.split(' ')[3]); i++) {
      const transitionFunction = machineTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('=')
      const [state, entry] = condition.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(state)) {
        return console.log('Invalid parameter')
      }

      if (!machineAlphabet.includes(entry)) {
        return console.log('Invalid parameter')
      }

      if (machineHead.currentState !== state || machineEntry[machineHead.currentPosition] !== entry) {
        continue
      }

      const [nextState, nextEntry, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(nextState)) {
        return console.log('Invalid parameter')
      }

      if (!machineAlphabet.includes(nextEntry)) {
        return console.log('Invalid parameter')
      }

      if (!['L', 'R'].includes(nextPosition)) {
        return console.log('Invalid parameter')
      }

      machineHead.currentState = nextState
      machineEntry[machineHead.currentPosition] = nextEntry
      machineHead.currentPosition = nextPosition === 'R' ? Number(machineHead.currentPosition) + 1 : Number(machineHead.currentPosition) - 1

      i = 0
    }

    if (machineHead.currentState === availableStates.slice(-1)) {
      return console.log('Accepted')
    } else {
      return console.log('Denied')
    }
  }

  return {
    start
  }
}

module.exports = TuringMachine
