const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { parseCsv } = require('../src/parseCsv')
const { dedupe } = require('../src/dedupe')

function feed(partial) {
  return {
    id: 'txn_x',
    syncBatch: 1,
    date: '2026-08-01',
    account: 'card',
    merchant: 'SHELL OIL 57318',
    memo: 'SHELL',
    amountCents: 100,
    ...partial,
  }
}

describe('dedupe', () => {
  it('keeps txn_1020 at 62.40 and txn_1046 at 518.35 from the higher batch', () => {
    const rows = parseCsv([
      'id,sync_batch,date,account,merchant,memo,amount',
      'txn_1020,1,2026-08-10,card,SHELL OIL 57318,PENDING - SHELL OIL,1.00',
      'txn_1046,1,2026-08-24,card,RESTAURANT DEPOT 0093,PENDING - RESTAURANT DEPOT,512.00',
      'txn_1020,2,2026-08-10,card,SHELL OIL 57318,SHELL OIL 57318,62.40',
      'txn_1046,2,2026-08-24,card,RESTAURANT DEPOT 0093,RESTAURANT DEPOT 0093,518.35',
    ].join('\n'))

    const byId = new Map(dedupe(rows).map((row) => [row.id, row]))
    assert.equal(byId.get('txn_1020').amountCents, 6240)
    assert.equal(byId.get('txn_1020').memo, 'SHELL OIL 57318')
    assert.equal(byId.get('txn_1020').syncBatch, 2)
    assert.equal(typeof byId.get('txn_1020').syncBatch, 'number')
    assert.equal(byId.get('txn_1046').amountCents, 51835)
    assert.equal(byId.get('txn_1046').memo, 'RESTAURANT DEPOT 0093')
  })

  it('compares sync batch as a number, so batch 10 beats a later batch 9', () => {
    const rows = parseCsv([
      'id,sync_batch,date,account,merchant,memo,amount',
      'txn_n,10,2026-08-01,card,SHELL OIL 57318,BATCH 10,10.00',
      'txn_n,9,2026-08-01,card,SHELL OIL 57318,BATCH 9,9.00',
    ].join('\n'))

    assert.equal(typeof rows[0].syncBatch, 'number')
    assert.equal(typeof rows[1].syncBatch, 'number')

    const [kept] = dedupe(rows)
    assert.equal(kept.amountCents, 1000)
    assert.equal(kept.memo, 'BATCH 10')
  })

  it('keeps the later row when id and sync batch are the same', () => {
    const [kept] = dedupe([
      feed({ id: 'txn_same', syncBatch: 4, amountCents: 100, memo: 'FIRST' }),
      feed({ id: 'txn_same', syncBatch: 4, amountCents: 250, memo: 'SECOND' }),
    ])
    assert.equal(kept.amountCents, 250)
    assert.equal(kept.memo, 'SECOND')
  })

  it('preserves first-seen order when a later batch replaces a row', () => {
    const kept = dedupe([
      feed({ id: 'txn_b', syncBatch: 1, amountCents: 1 }),
      feed({ id: 'txn_a', syncBatch: 1, amountCents: 2 }),
      feed({ id: 'txn_b', syncBatch: 2, amountCents: 3 }),
    ])
    assert.deepEqual(kept.map((row) => row.id), ['txn_b', 'txn_a'])
    assert.equal(kept[0].amountCents, 3)
  })
})
