const fs = require('node:fs')
const { parseCsv } = require('../src/parseCsv')
const { dedupe } = require('../src/dedupe')
const { classifyType } = require('../src/classifyType')
const { categorize } = require('../src/categorize')
const { formatCsv } = require('../src/formatCsv')
const { applySplits } = require('../src/split')


const text = fs.readFileSync(process.argv[2], 'utf8')
const rows = dedupe(parseCsv(text))

const lines = rows.map((row) => {
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
}).flatMap(applySplits)

process.stdout.write(formatCsv(lines))
