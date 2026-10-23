function formatAmount(cents) {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  const whole = Math.floor(absolute / 100)
  const fraction = String(absolute % 100).padStart(2, '0')
  return `${sign}${whole}.${fraction}`
}

function formatCsv(lines) {
  const header = 'transaction_id,date,type,category,amount,needs_review'
  const rows = lines.map((line) => [
    line.transactionId,
    line.date,
    line.type,
    line.category,
    formatAmount(line.amountCents),
    line.needsReview ? 'true' : 'false',
  ].join(','))
  return [header, ...rows, ''].join('\n')
}

module.exports = { formatCsv }
