const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { parseCsv } = require('../src/parseCsv')

describe('parseCsv', () => {
  it('parses CRLF input with numeric syncBatch and amountCents and no carriage return on the last column', () => {
    const csv = [
      'id,sync_batch,date,account,merchant,memo,amount',
      'txn_1,10,2026-08-01,card,SYSCO PHILA,SYSCO PHILA,12.34',
    ].join('\r\n') + '\r\n'

    const [row] = parseCsv(csv)

    assert.equal(row.syncBatch, 10)
    assert.equal(typeof row.syncBatch, 'number')
    assert.equal(row.amountCents, 1234)
    assert.equal(typeof row.amountCents, 'number')
    for (const value of Object.values(row)) {
      assert.equal(String(value).includes('\r'), false)
    }
  })

  it('keeps the sign for -0.05 and a one-digit fraction', () => {
    const rows = parseCsv([
      'id,sync_batch,date,account,merchant,memo,amount',
      'txn_a,1,2026-08-01,card,X,X,-0.05',
      'txn_b,1,2026-08-01,card,X,X,-1.5',
    ].join('\n'))

    assert.equal(rows[0].amountCents, -5)
    assert.equal(rows[1].amountCents, -150)
  })
})
