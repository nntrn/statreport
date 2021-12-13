function printSummary(dlSummary) {
  const pre = typeof dlSummary === 'string' ? JSON.parse($('pre').textContent) : dlSummary
  const topValues = pre.summary.filter(e => e.topValues)

  const summary = topValues
    .sort((a, b) => {

      if(a.distinct > b.distinct) {
        return 1
      }
      if(a.distinct < b.distinct) {
        return -1
      }
      return 0
    })
    .map(e => {
      const maxNameLen = Math.max(...e.topValues.map(c => c.value.length))
      const border = '-'.repeat(maxNameLen + 14)

      const header = [
        'name'.toString().padEnd(maxNameLen + 3, ' '),
        '%'.padEnd(5, ' '),
        'count'.padStart(6, ' ')
      ].join('')

      return [
        '',
        e.name.toUpperCase(),
        border,
        header, border,
        e.topValues.map(e => [
          e.value.toString().padEnd(maxNameLen + 3),
          e['%'] ? e['%'].toFixed(2).padEnd(5, ' ') : '-'.padEnd(5, ' '),
          e.count.toString().padStart(6)
        ].join('')).join('\n')
      ].join('\n')

    })
    .join('\n\n')

  return summary.replace(/﻿/g, '')
}

module.exports = printSummary

