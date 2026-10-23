const { findMerchant, transferPatterns } = require('./rules')

function classifyType(row) {
  const memo = row.memo.toUpperCase()
  const transfer = transferPatterns.some((pattern) => memo.includes(pattern))
  if (transfer && !findMerchant(row.merchant)) return 'transfer'
  if (row.account === 'card' && row.amountCents < 0) return 'refund'
  if (row.account === 'bank' && row.amountCents < 0) return 'deposit'
  return 'purchase'
}

module.exports = { classifyType }
