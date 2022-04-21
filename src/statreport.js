const fs = require('fs')
const dl = require('datalib')
const buildDataSummary = require('./stat')
const Summary = require('./summary')
const { createAndWrite } = require('./utils')

class StatReport {
  constructor(params = {}) {
    const { file, data, raw, stdin } = params
    Object.assign(this, params)
    this.file = file
    this.raw = stdin || (file && fs.readFileSync(file, 'utf8')) || ''
    this.stdin = stdin
    this.data = data || this.parseData()
    this.statreport = buildDataSummary(this.getData())
    this.writeTo = Object.entries(this).filter(e => e[0].indexOf('write') > -1).map(e => e[1]).filter(Boolean)[0]
  }

  getFile() {
    return this.file
  }

  getStdIn() {
    return this.stdin
  }

  getRaw() {
    return this.raw
  }

  setFile(filepath) {
    this.file = filepath
    return this
  }

  readFile(filepath = this.getFile()) {
    return filepath ? fs.readFileSync(filepath, 'utf8') : ''
  }

  setRaw(rawtext = this.getStdIn()) {
    this.raw = rawtext || this.readFile() || ''
    return this
  }

  parseData(text = this.getRaw()) {
    var data
    try {
      data = JSON.parse(text)
    } catch (err) {
      const headers = text.split('\n')[0].replace(/\./g, '_')
      data = dl.read([headers, text.split('\n').slice(1,)].flat(2).join('\n'), { type: 'csv', parse: 'auto' })
    }
    this.setData(data)
    return data
  }

  getData() {
    return this.data
  }

  setData(data = this.parseData()) {
    this.data = data
    return this
  }

  getStatReport() {
    return this.statreport
  }

  setStatReport(data = this.parseData()) {
    this.statreport = buildDataSummary(data)
    return this
  }

  setWriteTo(writepath) {
    this.writeTo = writepath
    return this
  }

  getWriteTo() {
    return this.writeTo ||
     Object.keys(this).filter(e => e.indexOf('write') > -1).map(e => this[e])
       .filter(Boolean)[0] || ''
  }

  buildSummary() {
    const summary = new Summary()
    const jsonstring = summary.getDataSummary(this.parseData())

    if(this.getWriteTo()) {
      return createAndWrite(this.getWriteTo(), jsonstring)
    }
    console.log(jsonstring)
    return this
  }

  build() {
    const jsonstring = JSON.stringify(this.getStatReport(), null, 2)
    console.log(jsonstring)

    if(this.getWriteTo()) {
      return createAndWrite(this.getWriteTo(), jsonstring)
    }
    return this
  }

}

module.exports = StatReport
