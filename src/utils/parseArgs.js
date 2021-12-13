function parseArgs(args) {
  const str = [args].flat(2).join(' ').split('>')[0]
  if(str.indexOf('--') < 0) {
    return {
      error: 1,
      args: str
    }
  }

  let stdIn = str.split(' ')
  return Object.fromEntries(
    stdIn
      .join(' ')
      .split('--')
      .filter(Boolean)
      .map((e) => {
        let a = e.trim().split(' ')
        let a2 = a.length > 2 ? a.slice(1) : a.slice(1).toString()
        return [a[0], a2]
      })
  )
}

module.exports = parseArgs
