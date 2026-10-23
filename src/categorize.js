const { findMerchant } = require('./rules')

function categorize(row, type) {
  if (type === 'transfer') return { category: 'Transfer', needsReview: false }
  const match = findMerchant(row.merchant)
  if (!match) return { category: 'Uncategorized', needsReview: true }
  return { category: match.category, needsReview: false }
}

module.exports = { categorize }
