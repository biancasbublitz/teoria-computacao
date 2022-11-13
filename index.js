const fs = require('fs')
const content = fs.readFileSync('entry.txt').toString()

console.log(content)
