const fs = require('fs')
const path = require('path')

function createAndWrite(dirPath = 'file.json', data = '') {
  fs.mkdir(path.dirname(dirPath), { recursive: true }, function () {
    if(typeof data === 'object') {
      fs.writeFileSync(dirPath, JSON.stringify(data, null, 2))
    } else {
      fs.writeFileSync(dirPath, data)
    }
  })
  return data
}

module.exports = createAndWrite
