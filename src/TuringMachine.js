const fs = require('fs')

function TuringMachine () {
  const machineHead = {
    currentState: '0',
    currentPosition: 0
  }

  const fileContent = fs.readFileSync('entry.txt').toString()
  const fileLines = fileContent.split('\n')

  const [machineInfo, availableStates, entryAlphabet, machineAlphabet] = fileLines.slice(0, 4)
  const machineEntry = (fileLines.slice(-1) + machineAlphabet.at(-1)).toString().split('')

  function start () {
    machineHead.currentState = availableStates.split(' ')[0]

    readTransitionFunctions()
  }

  function readTransitionFunctions () {
    const machineTransitionFunctions = fileLines.filter(line => line.includes('('))

    for (let i = 0; i < Number(machineInfo.split(' ')[3]); i++) {
      const transitionFunction = machineTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('=')
      const [state, entry] = condition.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(state)) {
        throw new Error('Invalid parameter')
      }

      if (!machineAlphabet.includes(entry)) {
        throw new Error('Invalid parameter')
      }

      if (machineHead.currentState !== state || machineEntry[machineHead.currentPosition] !== entry) {
        continue
      }

      const [nextState, nextEntry, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!availableStates.includes(nextState)) {
        throw new Error('Invalid parameter')
      }

      if (!machineAlphabet.includes(nextEntry)) {
        throw new Error('Invalid parameter')
      }

      if (!['L', 'R'].includes(nextPosition)) {
        throw new Error('Invalid parameter')
      }

      machineHead.currentState = nextState
      machineEntry[machineHead.currentPosition] = nextEntry
      machineHead.currentPosition = nextPosition === 'R' ? Number(machineHead.currentPosition) + 1 : Number(machineHead.currentPosition) - 1

      i = 0
    }

    if (machineHead.currentState === availableStates.slice(-1)) {
      console.log('Valid entry')
    }
  }

  return {
    start
  }
}

module.exports = TuringMachine
