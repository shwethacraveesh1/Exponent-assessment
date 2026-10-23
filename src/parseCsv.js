function toCents(amount) {
  const negative = amount.startsWith('-')
  const unsigned = negative ? amount.slice(1) : amount
  const [whole, fraction = '00'] = unsigned.split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return negative ? -cents : cents
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((line) => line !== '')
  return lines.slice(1).map((line) => {
    const [id, syncBatch, date, account, merchant, memo, amount] = line.split(',')
    return {
      id,
      syncBatch: Number(syncBatch),
      date,
      account,
      merchant,
      memo,
      amountCents: toCents(amount),
    }
  })
}

module.exports = { parseCsv }
