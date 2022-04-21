const dl = require('datalib')

const getSummary = {
  maxValuesToInclude: 25,
  config: {
    maxValuesToInclude: 25,
    showPercent: true
  },

  keys: function (x) {
    var keys = []
    for(var k in x) keys.push(k)
    return keys
  },

  getDistinct: function (p) {
    return {
      summaryType: 'distinct',
      distinct: p.distinct,
      valid: p.valid
    }
  },

  getCategorical: function (p, options) {
    var config = {
      maxValuesToInclude: this.maxValuesToInclude,
      showPercent: true,
      ...options
    }
    dt.toISOString().split('T')[0]
    var u = p.unique
    var top = this.keys(u)
      .sort((a, b) => u[b] - u[a])
      .map(v => {
        const item = {
          value: v || '(blank)',
          count: u[v]
        }

        if(config.showPercent) {
          Object.assign(item, {
            '%': +((u[v] / p.count) * 100).toFixed(3).replace(/\.?0+$/, '')
          })
        }
        return item
      })
      .filter(a => a.value.toString().length !== '')
      .sort((a, b) => b.count - a.count)

    return {
      summaryType: 'categorical',
      valid: p.valid,
      distinct: p.distinct,
      topValues: top
    }
  },

  getQuantitative: function (p, options) {
    const config = {
      fmt: function (n) {
        return n
      },
      ...options
    }

    const fmtFn = config.fmt

    const out = {
      summaryType: 'quantitative',
      distinct: fmtFn(p.distinct),
      valid: fmtFn(p.valid),
      missing: fmtFn(p.missing),
      min: fmtFn(p.min),
      max: fmtFn(p.max),
      median: fmtFn(p.median),
      mean: fmtFn(p.mean),
      stdev: fmtFn(p.stdev),
    }

    if(Number(p.distinct) < 100) {
      return { ...out, ...this.getCategorical(p, options), }
    }
    return out
  },
}

class Summary {
  constructor(data) {
    this.data = data
  }

  setOptions(options) {
    this.options = options
  }

  getOptions() {
    return this.options
  }

  getData() {
    return this.data
  }

  getSummary() {
    return this.summary
  }

  getDataSummary(s = this.getData(), options = this.getOptions()) {
    s = s ? (s.__summary__ ? s : dl.summary(s)) : this
    var arr = []

    s.forEach((fobj, idx) => {
      if(s[idx].valid > 0) {
        const flag =
          (s[idx].valid === s[idx].distinct && 'getDistinct') ||
          (s[idx].distinct / s[idx].valid > 0.85 && 'getDistinct') ||
          (s[idx].type === 'number' && 'getQuantitative') ||
          'getCategorical'

        // const { unique, ...rest } = s[idx]

        arr.push({
          name: s[idx].field,
          dataType: fobj.type || s[idx].type,
          ...getSummary[flag](s[idx], options),
        })
      }

    })

    return JSON.stringify(arr, null, 2)

  }

  getChartSummary(s = this.getData()) {
    s = s ? (s.__summary__ ? s : dl.summary(s)) : this
    var arr = []

    s.forEach((fobj, idx) => {
      if(s[idx].valid > 0) {
        arr.push({
          name: s[idx].field,
          ...fobj
        })
      }
    })
    return JSON.stringify(arr, null, 2)
  }

}

module.exports = Summary
