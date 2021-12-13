const dl = require('datalib')
const fs = require('fs')
const formatSummaryObj = require('./src/stat')
const printSummary = require('./src/printSummary')
const { parseArgs, removeTimeFromDate, createAndWrite } = require('./src/utils')

class StatReport {
  constructor(params) {
    if(Array.isArray(params)) {
      return new StatReport(parseArgs(params))
    }

    if(params.toString() === '[object Object]') {
      Object.assign(this, params)
      const { csvPath = '', data = [], write = false, ...more } = params
      this.csvPath = csvPath
      this.data = StatReport.getReportData(csvPath)
      this.statreport = StatReport.getSummary(this.getData())
      this.writePath = write

    }

  }

  static getCVSHeader(filepath) {
    return fs.readFileSync(filepath, 'utf8').split('\n').filter(Boolean).slice(0, 1)[0].replace(/\./g, '_')
  }

  static getSummary(data) {
    return formatSummaryObj(data)
  }

  static getReportData(csvPath) {
    return dl.csv(csvPath, StatReport.getCVSHeader(csvPath))
      .map((d) =>
        Object.entries(d)
          .map((a) => ({ [a[0]]: removeTimeFromDate(a[1]) }))
          .reduce((a, b) => Object.assign(a, b), {})
      )
  }

  getCSVPath() {
    return this.csvPath
  }

  getData() {
    return this.data
  }

  getStatReport() {
    return this.statreport
  }

  getDataPath() {
    return this.csvPath
  }

  getWritePath() {
    return this.writePath
  }

  setDataPath(filePath) {
    this.csvPath = filePath
    return this
  }

  setWritePath(filePath) {
    this.writePath = filePath
    return this
  }

  writeReport(writePath = this.getWritePath()) {
    createAndWrite(writePath, this.getStatReport())
  }

  init() {
    this.data = StatReport.getReportData(this.getDataPath())
    this.statreport = StatReport.getSummary(this.getData())
    if(this.getWritePath()) {
      this.writeReport(this.getWritePath())
    }
  }

}

module.exports = StatReport
