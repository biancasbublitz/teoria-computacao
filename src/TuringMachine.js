const fs = require('fs')

function Error (errorText) {
  return console.log(errorText)
}

function TuringMachine (fileName) {
  const machine = {
    head: {
      currentState: null,
      currentPosition: 0
    },
    info: null,
    availableStates: null,
    availableAlphabet: null,
    alphabet: null,
    transitionFunctions: [],
    input: null
  }

  function start () {
    const fileContent = fs.readFileSync(fileName).toString()
    const fileLines = fileContent.split('\n')

    const [machineInfo, availableStates, availableAlphabet, machineAlphabet] = fileLines.slice(0, 4)

    machine.info = machineInfo.split(' ')
    machine.availableStates = availableStates.split(' ')
    machine.availableAlphabet = availableAlphabet
    machine.alphabet = machineAlphabet
    machine.input = fileLines.slice(-1).join().split('')

    machine.head.currentState = machine.availableStates[0]

    if (!checkMachineInputIsValid()) {
      return Error('Invalid input')
    }

    const emptyCharacter = machine.alphabet.at(-1)
    machine.input.push(emptyCharacter)

    machine.transitionFunctions = fileLines.filter(line => line.includes('('))

    readTransitionFunctions()
  }

  function checkMachineInputIsValid () {
    const filtered = machine.input.filter(character => {
      return machine.availableAlphabet.includes(character)
    })

    return filtered.length === machine.input.length
  }

  function readTransitionFunctions () {
    for (let i = 0; i < Number(machine.info[3]); i++) {
      const transitionFunction = machine.transitionFunctions[i]

      const [condition, result] = transitionFunction.split('=')
      const [state, entry] = condition.replace('(', '').replace(')', '').split(',')

      if (!machine.availableStates.includes(state)) {
        return Error('Invalid parameter')
      }

      if (!machine.alphabet.includes(entry)) {
        return Error('Invalid parameter')
      }

      if (machine.head.currentState !== state || machine.input[machine.head.currentPosition] !== entry) {
        continue
      }

      const [nextState, nextEntry, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!machine.availableStates.includes(nextState)) {
        return Error('Invalid parameter')
      }

      if (!machine.alphabet.includes(nextEntry)) {
        return Error('Invalid parameter')
      }

      if (!['L', 'R'].includes(nextPosition)) {
        return Error('Invalid parameter')
      }

      machine.head.currentState = nextState
      machine.input[machine.head.currentPosition] = nextEntry
      machine.head.currentPosition = nextPosition === 'R' ? Number(machine.head.currentPosition) + 1 : Number(machine.head.currentPosition) - 1

      i = 0
    }

    if (machine.head.currentState === machine.availableStates.at(-1)) {
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
