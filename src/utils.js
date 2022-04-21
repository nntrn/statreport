const fs = require('fs')
const path = require('path')

const isFlag = (str) => /^[-]{1,2}[a-z]/.test(str)

function createAndWrite(dirPath = '', data = '') {
  if(!dirPath) {
    return data
  }
  fs.mkdir(path.dirname(dirPath), { recursive: true }, function () {
    if(typeof data === 'object') {
      fs.writeFileSync(dirPath, JSON.stringify(data, null, 2))
    } else {
      fs.writeFileSync(dirPath, data)
    }
  })
  return data
}

function cliArgs(args = process.argv) {
  const retVal = {}
  while(args.length > 0) {
    if(args.length === 1 || isFlag(args[0]) && isFlag(args[1])) {
      Object.assign(retVal, { [camelCase(args[0])]: true })
      args.splice(0, 1)
      continue
    }
    Object.assign(retVal, { [camelCase(args[0])]: args[1] })
    args.splice(0, 2)
  }
  return retVal
}
exports.cliArgs = cliArgs

function readStdin() {
  return new Promise((resolve, reject) => {
    let content = ''
    let chunk = ''
    process.stdin
      .setEncoding('utf8')
      .on('readable', () => {
        while((chunk = process.stdin.read()) !== null) {
          content += chunk
        }
      })
      .on('end', () => resolve(content))
      .on('error', reject)
  })
}
exports.readStdin = readStdin

function parseArgs(args) {
  if(args.join(' ').indexOf('--') < 0) {
    return args
  }
  let stdIn = args.join(' ').split('>')[0].split(' ')
  return Object.fromEntries(stdIn
    .join(' ')
    .split('--')
    .filter(Boolean)
    .map(e => {
      let a = e.trim().split(' ')
      let a2 = a.length > 2 ? a.slice(1,) : a.slice(1,).toString()
      return [a[0], a2]
    }))
}

// example
// pipe(odds, double, log)([1, 2, 3, 4, 5])
function pipe(...fns) {
  return (arg) => fns.reduce((prev, fn) => fn(prev), arg)
}

function read(filePath) {
  if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    var fileStr = fs.readFileSync(filePath, 'utf-8')
    if(/\.json$/.test(filePath)) {
      try { fileStr = JSON.parse(fileStr)
      } catch (e) {}
    }
    return fileStr
  }
}

function fold(str, size, arr) {
  arr = arr || []
  if(str.length <= size) {
    arr.push(str)
    return arr
  }
  arr.push(str.substring(0, size))
  var tail = str.substring(size)
  return fold(tail, size, arr)
}

// returnns YYYY-MM-DD
function getISODate(dt = new Date) {
  return (new Date(dt)).toISOString().split('T')[0]
}

function getAllDirectoryFiles(dirPath) {
  return fs.readdirSync(dirPath)
    .map(e => path.join(dirPath, e))
    .map(file => fs.statSync(file).isDirectory() ? getAllDirectoryFiles(file) : file)
    .flat()
}

function camelCase(str) {
  return str.replace(/[^a-zA-Z]+(\w)/gi, function (word, letter) {
    return letter.toUpperCase()
  })
}

function kebabCase(flag) {
  return flag.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function formatNote(str = '') {
  const note = str.match(/.{0,75}([\s|\n]|\W)/g) || []
  return note.length > 0 ? note
    .filter(Boolean)
    .map(e => e.trim().length > 0 ? `#    ${e.replace(/^[\s\#]{0,2}/, '')}` : '')
    .filter(Boolean) : ''
}

function detectScriptLine(str) {
  if(str.charAt(0) === '$' && str.charAt(1) !== '(') {
    return true
  }
  return false
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}

const flattenJSON = (obj = {}, res = {}, extraKey = '') => {
  for(key in obj) {
    if(typeof obj[key] !== 'object') {
      res[extraKey + key] = obj[key]
    } else {
      flattenJSON(obj[key], res, `${extraKey}${key}_`)
    };
  };
  return res
}

function removeTimeFromDate(str) {
  if(str && /^[0-9:\-\/]+ [0-9:]+$/.test(str) && !isNaN(Date.parse(str))) {
    return new Date(str).toISOString().split('T')[0]
  }
  return str
}

exports.flattenJSON = flattenJSON
exports.createAndWrite = createAndWrite
exports.parseArgs = parseArgs
exports.pipe = pipe
exports.read = read
exports.fold = fold
exports.getISODate = getISODate
exports.getAllDirectoryFiles = getAllDirectoryFiles
exports.camelCase = camelCase
exports.kebabCase = kebabCase
exports.formatNote = formatNote
exports.detectScriptLine = detectScriptLine
exports.getUserHome = getUserHome
exports.removeTimeFromDate = removeTimeFromDate
