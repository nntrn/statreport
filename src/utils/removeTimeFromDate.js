function removeTimeFromDate(str) {
  if(str && /^[0-9:\-\/]+ [0-9:]+$/.test(str) && !isNaN(Date.parse(str))) {
    return new Date(str).toISOString().split('T')[0]
  }
  return str
}

module.exports = removeTimeFromDate
