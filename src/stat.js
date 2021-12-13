var dl = require('datalib')

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

  getQuantitative2: function (p, options) {
    const config = {
      fmt: function (n) {
        return n
      },
      ...options
    }

    const fmtFn = config.fmt
    return {
      summaryType: 'quantitative',
      distinct: fmtFn(p.distinct),
      valid: fmtFn(p.valid),
      missing: fmtFn(p.missing),
      min: fmtFn(p.min),
      max: fmtFn(p.max),
      median: fmtFn(p.median),
      mean: fmtFn(p.mean),
      stdev: fmtFn(p.stdev)
      // modeskew: fmtFn(p.modeskew),
      // ...this.getCategorical(p, options),
    }
  },

  getCategorical: function (p, options) {
    var config = {
      maxValuesToInclude: this.maxValuesToInclude,
      showPercent: true,
      ...options
    }

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

    // lump items with only 1 count into 'others'
    // if(top.length > config.maxValuesToInclude) {
    //   var others = top.slice(config.maxValuesToInclude)
    //   var findOne = top.map(e => e.count).indexOf(1)
    //   if(findOne > -1) {
    //     others = top.splice(findOne)
    //   }

    //   const otherCount = others.map(e => e.count).reduce((a, b) => a + b)

    //   top.push({
    //     value: 'other',
    //     count: otherCount,
    //     pct: +((otherCount / p.count) * 100).toFixed(3).replace(/\.?0+$/, '')
    //   })
    // }

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
      // modeskew: fmtFn(p.modeskew),

    }

    if(Number(p.distinct) < 100) {
      return { ...out, ...this.getCategorical(p, options), }
    }
    return out
  },
}

function formatSummaryObj(s, options) {
  s = s ? (s.__summary__ ? s : dl.summary(s)) : this
  var arr = []
  const emptySummary = []

  s.forEach((fobj, idx) => {
    if(s[idx].valid > 0) {
      const flag =
        (s[idx].valid === s[idx].distinct && 'getDistinct') ||
        (s[idx].distinct / s[idx].valid > 0.85 && 'getDistinct') ||
        (s[idx].type === 'number' && 'getQuantitative') ||
        'getCategorical'

      const { unique, ...rest } = s[idx]

      arr.push({
        name: s[idx].field,
        dataType: s[idx].type,
        // ...rest,
        ...getSummary[flag](s[idx], options)
      })
    } else {
      emptySummary.push(s[idx].field)
    }
  })

  return {
    summary: arr,
    empty: emptySummary
  }
}

module.exports = formatSummaryObj
