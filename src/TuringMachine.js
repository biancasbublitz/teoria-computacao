function Error (errorText) {
  return console.log(errorText)
}

function TuringMachine (fileName) {
  const machineInfo = {
    currentState: null,
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
    revertedTransitionFunctions: []
  }

  const inputTape = {
    content: [],
    currentPosition: 0
  }

  const historyTape = {
    content: [],
    currentPosition: 0
  }

  const outputTape = {
    content: [],
    currentPosition: 0
  }

  function start () {
    const fs = require('fs')
    const fileContent = fs.readFileSync(fileName).toString()
    const fileLines = fileContent.split('\n')

    const [rawMachineInfo, availableStates, availableAlphabet, machineAlphabet] = fileLines.slice(0, 4)
    const machineData = rawMachineInfo.split(' ')

    machineInfo.info = {
      numberOfStates: Number(machineData[0]),
      availableAlphabetLength: Number(machineData[1]),
      machineAlphabetLength: Number(machineData[2]),
      numberOfTransitions: Number(machineData[3])
    }
    machineInfo.availableStates = availableStates.split(' ')
    machineInfo.availableAlphabet = availableAlphabet.split(' ')
    machineInfo.alphabet = machineAlphabet.split(' ')
    inputTape.content = fileLines.slice(-1).join().length > 0 ? fileLines.slice(-1).join().split('') : ''
    machineInfo.currentState = machineInfo.availableStates[0]

    if (!checkMachineInputIsValid()) {
      return Error('Invalid input')
    }

    const emptyCharacter = machineInfo.alphabet.at(-1)
    inputTape.content.push(emptyCharacter)

    machineInfo.transitionFunctions = fileLines.filter(line => line.includes('('))

    const machineTransitionFunctionsAreValid = checkMachineTransitionFunctionsAreValid()

    if (machineTransitionFunctionsAreValid.success === false) {
      return Error(machineTransitionFunctionsAreValid.error)
    }

    fillReversibleTransitionFunctions()
    runReversibleTransitionFunctions()
    copyInputTapeToOutputTape()
    revertReversibleTransitionFunctions()
  }

  function checkMachineTransitionFunctionsAreValid () {
    for (const transitionFunction of machineInfo.transitionFunctions) {
      const [condition, result] = transitionFunction.split('=')
      const [state, input] = condition.replace('(', '').replace(')', '').split(',')

      if (!machineInfo.availableStates.includes(state)) {
        return { success: false, error: `Invalid state: ${state}` }
      }

      if (!machineInfo.alphabet.includes(input)) {
        return { success: false, error: `Invalid machine input: ${input}` }
      }

      const [nextState, nextInput, nextPosition] = result.replace('(', '').replace(')', '').split(',')

      if (!machineInfo.availableStates.includes(nextState)) {
        return { success: false, error: `Invalid state: ${nextState}` }
      }

      if (!machineInfo.alphabet.includes(nextInput)) {
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
    if (!inputTape.content) return false

    const filtered = inputTape.content.filter(character => {
      return machineInfo.availableAlphabet.includes(character)
    })

    return filtered.length === inputTape.content.length
  }

  function fillReversibleTransitionFunctions () {
    machineInfo.transitionFunctions.forEach((transitionFunction, index) => {
      const [condition, result] = transitionFunction.split('=')
      const [currentState, currentInput] = condition.replace('(', '').replace(')', '').split(',')
      const [nextState, nextInput, nextPosition] = result.replace('(', '').replace(')', '').split(',')
      const reversibleNextPosition = nextPosition === 'R' ? '+' : '-'
      const emptyCharacter = inputTape.content[inputTape.content.length - 1]

      machineInfo.reversibleTransitionFunctions.push(`${currentState}[${currentInput} / ${emptyCharacter}]->[${nextInput} + ${emptyCharacter}]${currentState}_${index}`)
      machineInfo.reversibleTransitionFunctions.push(`${currentState}_${index}[/ ${emptyCharacter} /]->[\\ ${reversibleNextPosition} ${currentState}_${index} 0]${nextState}`)
    })
  }

  function runReversibleTransitionFunctions () {
    for (let i = 0; i < machineInfo.reversibleTransitionFunctions.length; i++) {
      const transitionFunction = machineInfo.reversibleTransitionFunctions[i]

      const [condition, result] = transitionFunction.split('->')
      const [state, tapesInfo] = condition.replace(']', '').split('[')
      const [input, history, output] = tapesInfo.split(' ')

      if (machineInfo.currentState !== state) {
        continue
      }

      if (inputTape.content[inputTape.currentPosition] === input) {
        const [nextTapesInfo, nextState] = result.replace('[', '').split(']')
        const [inputNextInput, historyNextPosition, outputNextInput] = nextTapesInfo.split(' ')

        machineInfo.currentState = nextState
        inputTape.content[inputTape.currentPosition] = inputNextInput
        historyTape.currentPosition = historyNextPosition === '+' ? Number(historyTape.currentPosition) + 1 : Number(historyTape.currentPosition) - 1
        outputTape.content[outputTape.currentPosition] = outputNextInput

        continue
      }

      if (input === '/') {
        const [nextTapesInfo, nextState] = result.replace('[\\ ', '').split(']')
        const [inputNextPosition, historyNextInput, outputNextPosition] = nextTapesInfo.split(' ')

        machineInfo.currentState = nextState
        inputTape.currentPosition = inputNextPosition === '+' ? Number(inputTape.currentPosition) + 1 : Number(inputTape.currentPosition) - 1
        historyTape.content.push(historyNextInput)
        // machineInfo.head.outputCurrentPosition = machineInfo.head.outputCurrentPosition

        i = 0
      }
    }

    if (machineInfo.currentState === machineInfo.availableStates.at(-1)) {
      return Error('Accepted')
    } else {
      return Error('Denied')
    }
  }

  function copyInputTapeToOutputTape () {
    outputTape.content.splice(0)
    inputTape.content.forEach(character => outputTape.content.push(character))
  }

  function revertReversibleTransitionFunctions () {
    machineInfo.reversibleTransitionFunctions.forEach((transitionFunction, index) => {
      const [condition, result] = transitionFunction.split('->')
      const [state, tapesInfo] = condition.replace(']', '').split('[')
      const [input, history, output] = tapesInfo.split(' ')

      const emptyCharacter = inputTape.content[inputTape.content.length - 1]

      if (input === '/') {
        const [nextTapesInfo, nextState] = result.replace('[\\ ', '').split(']')
        const [inputNextPosition, historyNextInput, outputNextPosition] = nextTapesInfo.split(' ')

        const nextPosition = inputNextPosition === '+' ? '-' : '+'

        machineInfo.revertedTransitionFunctions.push(`${nextState}[/ ${state} /]->[\\${nextPosition} ${emptyCharacter} 0] ${state}`)
      } else {
        const [nextTapesInfo, nextState] = result.replace('[', '').split(']')
        const [inputNextInput, historyNextPosition, outputNextInput] = nextTapesInfo.split(' ')

        const nextPosition = historyNextPosition === '+' ? '-' : '+'

        machineInfo.revertedTransitionFunctions.push(`${nextState}[${inputNextInput} / ${emptyCharacter}]->[0 ${nextPosition} ${emptyCharacter}]${state}`)
      }
    })
  }

  return {
    start
  }
}

module.exports = TuringMachine
