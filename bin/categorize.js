const fs = require('node:fs')
const { parseCsv } = require('../src/parseCsv')
const { dedupe } = require('../src/dedupe')
const { classifyType } = require('../src/classifyType')
const { categorize } = require('../src/categorize')
const { formatCsv } = require('../src/formatCsv')

const text = fs.readFileSync(process.argv[2], 'utf8')
const lines = dedupe(parseCsv(text)).map((row) => {
  const type = classifyType(row)
  const { category, needsReview } = categorize(row, type)
  return {
    transactionId: row.id,
    date: row.date,
    type,
    category,
    amountCents: row.amountCents,
    needsReview,
  }
})

process.stdout.write(formatCsv(lines))
