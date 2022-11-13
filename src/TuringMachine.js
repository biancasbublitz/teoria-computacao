const fs = require('fs')

function Error (errorText) {
  return console.log(errorText)
}

function TuringMachine (fileName) {
  const machineHead = {
    currentState: '0',
    currentPosition: 0
  }

  function start () {
    const fileContent = fs.readFileSync(fileName).toString()
    const fileLines = fileContent.split('\n')

    const [machineInfo, availableStates, entryAlphabet, machineAlphabet] = fileLines.slice(0, 4)
    const machineEntry = fileLines.slice(-1).toString().split('')

    const initialState = availableStates.split(' ')[0]
    machineHead.currentState = initialState

    const machineEntryIsValid = checkMachineEntryIsValid(machineEntry, entryAlphabet)

    if (!machineEntryIsValid) {
      return Error('Invalid entry')
    }

    const emptyCharacter = machineAlphabet.at(-1)
    machineEntry.push(emptyCharacter)

    const machineTransitionFunctions = fileLines.filter(line => line.includes('('))

    readTransitionFunctions(machineTransitionFunctions, machineInfo, availableStates, machineAlphabet, machineEntry)
  }

  function checkMachineEntryIsValid (machineEntry, entryAlphabet) {
    const filtered = machineEntry.filter(character => {
      return entryAlphabet.includes(character)
    })

    return filtered.length === machineEntry.length
  }

  function readTransitionFunctions (machineTransitionFunctions, machineInfo, availableStates, machineAlphabet, machineEntry) {
    for (let i = 0; i < Number(machineInfo.split(' ')[3]); i++) {
      const transitionFunction = machineTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('=')
      const [state, entry] = condition.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(state)) {
        return Error('Invalid parameter')
      }

      if (!machineAlphabet.includes(entry)) {
        return Error('Invalid parameter')
      }

      if (machineHead.currentState !== state || machineEntry[machineHead.currentPosition] !== entry) {
        continue
      }

      const [nextState, nextEntry, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(nextState)) {
        return Error('Invalid parameter')
      }

      if (!machineAlphabet.includes(nextEntry)) {
        return Error('Invalid parameter')
      }

      if (!['L', 'R'].includes(nextPosition)) {
        return Error('Invalid parameter')
      }

      machineHead.currentState = nextState
      machineEntry[machineHead.currentPosition] = nextEntry
      machineHead.currentPosition = nextPosition === 'R' ? Number(machineHead.currentPosition) + 1 : Number(machineHead.currentPosition) - 1

      i = 0
    }

    if (machineHead.currentState === availableStates.slice(-1)) {
      return Error('Accepted')
    } else {
      return Error('Denied')
    }
  }

  return {
    start
  }
}

module.exports = TuringMachine
