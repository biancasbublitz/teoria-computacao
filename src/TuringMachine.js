function Error (errorText) {
  return console.log(errorText)
}

function TuringMachine (fileName) {
  const machine = {
    head: {
      currentState: null,
      inputCurrentPosition: 0,
      historyCurrentPosition: 0,
      outputCurrentPosition: 0
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
    tapes: {
      input: null,
      history: [],
      output: []
    }
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
    machine.tapes.input = fileLines.slice(-1).join().length > 0 ? fileLines.slice(-1).join().split('') : ''
    machine.head.currentState = machine.availableStates[0]

    if (!checkMachineInputIsValid()) {
      return Error('Invalid input')
    }

    const emptyCharacter = machine.alphabet.at(-1)
    machine.tapes.input.push(emptyCharacter)

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
    if (!machine.tapes.input) return false

    const filtered = machine.tapes.input.filter(character => {
      return machine.availableAlphabet.includes(character)
    })

    return filtered.length === machine.tapes.input.length
  }

  function fillReversibleTransitionFunctions () {
    machine.transitionFunctions.forEach((transitionFunction, index) => {
      const [condition, result] = transitionFunction.split('=')
      const [currentState, currentInput] = condition.replace('(', '').replace(')', '').split(',')
      const [nextState, nextInput, nextPosition] = result.replace('(', '').replace(')', '').split(',')
      const reversibleNextPosition = nextPosition === 'R' ? '+' : '-'
      const emptyCharacter = machine.tapes.input[machine.tapes.input.length - 1]

      machine.reversibleTransitionFunctions.push(`${currentState}[${currentInput} / ${emptyCharacter}]->[${nextInput} + ${emptyCharacter}]${currentState}_${index}`)
      machine.reversibleTransitionFunctions.push(`${currentState}_${index}[/ ${emptyCharacter} /]->[\\ ${reversibleNextPosition} ${currentState}_${index} 0]${nextState}`)
    })
  }

  function runReversibleTransitionFunctions () {
    for (let i = 0; i < machine.reversibleTransitionFunctions.length; i++) {
      const transitionFunction = machine.reversibleTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('->')
      const [state, tapesInfo] = condition.replace(']', '').split('[')
      const [input, history, output] = tapesInfo.split(' ')

      if (machine.head.currentState !== state) {
        continue
      }

      if (machine.tapes.input[machine.head.inputCurrentPosition] === input) {
        const [nextTapesInfo, nextState] = result.replace('[', '').split(']')
        const [inputNextInput, historyNextPosition, outputNextInput] = nextTapesInfo.split(' ')

        machine.head.currentState = nextState
        machine.tapes.input[machine.head.inputCurrentPosition] = inputNextInput
        machine.head.historyCurrentPosition = historyNextPosition === '+' ? Number(machine.head.historyNextPosition) + 1 : Number(machine.head.historyNextPosition) - 1
        machine.tapes.output[machine.head.outputCurrentPosition] = outputNextInput

        continue
      }

      if (input === '/') {
        const [nextTapesInfo, nextState] = result.replace('[\\ ', '').split(']')
        const [inputNextPosition, historyNextInput, outputNextPosition] = nextTapesInfo.split(' ')

        machine.head.currentState = nextState
        machine.head.inputCurrentPosition = inputNextPosition === '+' ? Number(machine.head.inputCurrentPosition) + 1 : Number(machine.head.inputCurrentPosition) - 1
        machine.tapes.history.push(historyNextInput)
        // machine.head.outputCurrentPosition = machine.head.outputCurrentPosition

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
