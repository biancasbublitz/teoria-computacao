function Error (errorText) {
  return console.log(errorText)
}

function TuringMachine (fileName) {
  const machine = {
    head: {
      currentState: null,
      currentPosition: 0
    },
    info: {
      numberOfStates: 0,
      availableAlphabetLength: 0,
      machineAlphabetLength: 0,
      numberOfTransitions: 0
    },
    availableStates: [],
    availableAlphabet: [],
    alphabet: [],
    transitionFunctions: [],
    reversibleTransitionFunctions: [],
    input: null
  }

  function start () {
    const fs = require('fs')
    const fileContent = fs.readFileSync(fileName).toString()
    const fileLines = fileContent.split('\n')

    const [rawMachineInfo, availableStates, availableAlphabet, machineAlphabet] = fileLines.slice(0, 4)
    const machineInfo = rawMachineInfo.split(' ')

    machine.info = {
      numberOfStates: Number(machineInfo[0]),
      availableAlphabetLength: Number(machineInfo[1]),
      machineAlphabetLength: Number(machineInfo[2]),
      numberOfTransitions: Number(machineInfo[3])
    }
    machine.availableStates = availableStates.split(' ')
    machine.availableAlphabet = availableAlphabet.split(' ')
    machine.alphabet = machineAlphabet.split(' ')
    machine.input = fileLines.slice(-1).join().length > 0 ? fileLines.slice(-1).join().split('') : ''
    machine.head.currentState = machine.availableStates[0]

    if (!checkMachineInputIsValid()) {
      return Error('Invalid input')
    }

    const emptyCharacter = machine.alphabet.at(-1)
    machine.input.push(emptyCharacter)

    machine.transitionFunctions = fileLines.filter(line => line.includes('('))

    const machineTransitionFunctionsAreValid = checkMachineTransitionFunctionsAreValid()

    if (machineTransitionFunctionsAreValid.success === false) {
      return Error(machineTransitionFunctionsAreValid.error)
    }

    fillReversibleTransitionFunctions()
    runReversibleTransitionFunctions()
  }

  function checkMachineTransitionFunctionsAreValid () {
    for (const transitionFunction of machine.transitionFunctions) {
      const [condition, result] = transitionFunction.split('=')
      const [state, input] = condition.replace('(', '').replace(')', '').split(',')

      if (!machine.availableStates.includes(state)) {
        return { success: false, error: `Invalid state: ${state}` }
      }

      if (!machine.alphabet.includes(input)) {
        return { success: false, error: `Invalid machine input: ${input}` }
      }

      const [nextState, nextInput, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!machine.availableStates.includes(nextState)) {
        return { success: false, error: `Invalid state: ${nextState}` }
      }

      if (!machine.alphabet.includes(nextInput)) {
        return { success: false, error: `Invalid machine input: ${nextInput}` }
      }

      const availableDirections = ['L', 'R']

      if (!availableDirections.includes(nextPosition)) {
        return { success: false, error: `Invalid direction: ${nextPosition}` }
      }
    }

    return { success: true }
  }

  function checkMachineInputIsValid () {
    if (!machine.input) return false

    const filtered = machine.input.filter(character => {
      return machine.availableAlphabet.includes(character)
    })

    return filtered.length === machine.input.length
  }

  function fillReversibleTransitionFunctions () {
    machine.transitionFunctions.forEach((transitionFunction, index) => {
      const [condition, result] = transitionFunction.split('=')
      const [currentState, currentInput] = condition.replace('(', '').replace(')', '').split(',')

      const [nextState, nextInput, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      const reversibleNextPosition = nextPosition === 'R' ? '+' : '-'

      machine.reversibleTransitionFunctions.push(`${currentState} ${currentInput}->${nextInput} ${currentState}_${index}`)
      machine.reversibleTransitionFunctions.push(`${currentState}_${index} /->\\ ${reversibleNextPosition} ${nextState}`)
    })
  }

  function runReversibleTransitionFunctions () {
    for (let i = 0; i < machine.reversibleTransitionFunctions.length; i++) {
      const transitionFunction = machine.reversibleTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('->')
      const [state, inputOrAction] = condition.split(' ')

      if (machine.head.currentState !== state) {
        continue
      }

      if (machine.input[machine.head.currentPosition] === inputOrAction) {
        const [nextInput, nextState] = result.split(' ')

        machine.head.currentState = nextState
        machine.input[machine.head.currentPosition] = nextInput

        continue
      }

      if (inputOrAction === '/') {
        const [, nextPosition, nextState] = result.split(' ')

        machine.head.currentState = nextState
        machine.head.currentPosition = nextPosition === '+' ? Number(machine.head.currentPosition) + 1 : Number(machine.head.currentPosition) - 1

        i = 0
      }
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
