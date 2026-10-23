const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { formatCsv } = require('../src/formatCsv')

describe('formatCsv', () => {
  it('prints cents with two decimals, keeps the sign, and writes lowercase booleans', () => {
    const csv = formatCsv([
      {
        transactionId: 'txn_1010',
        date: '2026-08-06',
        type: 'purchase',
        category: 'Cleaning & supplies',
        amountCents: 23300,
        needsReview: false,
      },
      {
        transactionId: 'txn_1018',
        date: '2026-08-08',
        type: 'refund',
        category: 'Food & beverage',
        amountCents: -18420,
        needsReview: true,
      },
    ])

    assert.equal(
      csv,
      [
        'transaction_id,date,type,category,amount,needs_review',
        'txn_1010,2026-08-06,purchase,Cleaning & supplies,233.00,false',
        'txn_1018,2026-08-08,refund,Food & beverage,-184.20,true',
        '',
      ].join('\n'),
    )
  })

  it('prints sub-dollar and zero amounts with a leading zero', () => {
    const csv = formatCsv([
      {
        transactionId: 'txn_neg',
        date: '2026-08-01',
        type: 'refund',
        category: 'Uncategorized',
        amountCents: -5,
        needsReview: false,
      },
      {
        transactionId: 'txn_pos',
        date: '2026-08-01',
        type: 'purchase',
        category: 'Uncategorized',
        amountCents: 7,
        needsReview: false,
      },
      {
        transactionId: 'txn_zero',
        date: '2026-08-01',
        type: 'purchase',
        category: 'Uncategorized',
        amountCents: 0,
        needsReview: false,
      },
    ])

    assert.equal(
      csv,
      [
        'transaction_id,date,type,category,amount,needs_review',
        'txn_neg,2026-08-01,refund,Uncategorized,-0.05,false',
        'txn_pos,2026-08-01,purchase,Uncategorized,0.07,false',
        'txn_zero,2026-08-01,purchase,Uncategorized,0.00,false',
        '',
      ].join('\n'),
    )
  })
})
