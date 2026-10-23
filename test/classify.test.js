const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { findMerchant } = require('../src/rules')
const { classifyType } = require('../src/classifyType')
const { categorize } = require('../src/categorize')

function feed(partial) {
  return {
    id: 'txn_x',
    syncBatch: 1,
    date: '2026-08-01',
    account: 'card',
    merchant: 'UNKNOWN MERCHANT',
    memo: 'UNKNOWN MEMO',
    amountCents: 100,
    ...partial,
  }
}

function classified(partial) {
  const row = feed(partial)
  const type = classifyType(row)
  const { category, needsReview } = categorize(row, type)
  return { type, category, needsReview }
}

describe('transfers', () => {
  it('classifies each own-account leg on its own row', () => {
    const legs = [
      { id: 'txn_1016', account: 'bank', merchant: 'ONLINE PAYMENT TO CARD 4421', memo: 'ONLINE PAYMENT TO CARD 4421', amountCents: 485000 },
      { id: 'txn_1017', account: 'card', merchant: 'PAYMENT RECEIVED', memo: 'ONLINE PAYMENT - THANK YOU', amountCents: -485000 },
      { id: 'txn_1027', account: 'bank', merchant: 'TRANSFER TO SAVINGS 8810', memo: 'ONLINE TRANSFER TO SAVINGS 8810', amountCents: 1000000 },
      { id: 'txn_1040', account: 'bank', merchant: 'TRANSFER FROM SAVINGS 8810', memo: 'ONLINE TRANSFER FROM SAVINGS 8810', amountCents: -500000 },
      { id: 'txn_1051', account: 'bank', merchant: 'ONLINE PAYMENT TO CARD 4421', memo: 'ONLINE PAYMENT TO CARD 4421', amountCents: 620000 },
      { id: 'txn_1052', account: 'card', merchant: 'PAYMENT RECEIVED', memo: 'ONLINE PAYMENT - THANK YOU', amountCents: -620000 },
    ]
    for (const leg of legs) {
      assert.deepEqual(
        classified(leg),
        { type: 'transfer', category: 'Transfer', needsReview: false },
        leg.id,
      )
    }
  })

  it('matches transfer phrases without caring about case', () => {
    assert.deepEqual(
      classified({
        account: 'bank',
        merchant: 'ONLINE PAYMENT TO CARD 4421',
        memo: 'online payment to card 4421',
        amountCents: 100,
      }),
      { type: 'transfer', category: 'Transfer', needsReview: false },
    )
  })

  it('never treats a listed merchant as a transfer', () => {
    assert.deepEqual(
      classified({
        account: 'card',
        merchant: 'SYSCO PHILA 8827',
        memo: 'ONLINE PAYMENT TO CARD 4421',
        amountCents: 184217,
      }),
      { type: 'purchase', category: 'Food & beverage', needsReview: false },
    )
  })
})

describe('JOES PLUMBING ACH', () => {
  it('is an uncategorized purchase, not a transfer', () => {
    assert.deepEqual(
      classified({
        account: 'bank',
        merchant: 'JOES PLUMBING',
        memo: 'JOES PLUMBING ACH',
        amountCents: 18000,
      }),
      { type: 'purchase', category: 'Uncategorized', needsReview: true },
    )
  })
})

describe('SQUARE PAYOUT', () => {
  it('is a deposit even though the merchant is not on the list', () => {
    assert.deepEqual(
      classified({
        account: 'bank',
        merchant: 'SQUARE PAYOUT',
        memo: 'SQUARE PAYOUT',
        amountCents: -8425,
      }),
      { type: 'deposit', category: 'Uncategorized', needsReview: true },
    )
  })
})

describe('txn_1022', () => {
  it('is a rent purchase, not a transfer', () => {
    assert.deepEqual(
      classified({
        id: 'txn_1022',
        account: 'bank',
        merchant: 'MAINLINE PROPERTIES LLC',
        memo: 'ACH PAYMENT MAINLINE PROPERTIES',
        amountCents: 650000,
      }),
      { type: 'purchase', category: 'Rent', needsReview: false },
    )
  })
})

describe('memos that only look like payments', () => {
  it('does not treat PAYOUT, PAYROLL, or AUTOPAY as transfers', () => {
    assert.deepEqual(
      classified({
        id: 'txn_1002',
        account: 'bank',
        merchant: 'DOORDASH PAYOUT',
        memo: 'DOORDASH INC PAYOUT',
        amountCents: -221045,
      }),
      { type: 'deposit', category: 'Delivery sales', needsReview: false },
    )
    assert.deepEqual(
      classified({
        id: 'txn_1023',
        account: 'bank',
        merchant: 'GUSTO',
        memo: 'GUSTO PAYROLL',
        amountCents: 1421066,
      }),
      { type: 'purchase', category: 'Payroll', needsReview: false },
    )
    assert.deepEqual(
      classified({
        id: 'txn_1007',
        account: 'bank',
        merchant: 'METRO GAS & ELECTRIC',
        memo: 'AUTOPAY METRO GAS & ELECTRIC',
        amountCents: 128840,
      }),
      { type: 'purchase', category: 'Utilities', needsReview: false },
    )
  })
})

describe('refunds', () => {
  it('keeps the purchase category and does not send known merchants to review', () => {
    assert.deepEqual(
      classified({
        id: 'txn_1018',
        account: 'card',
        merchant: 'SYSCO PHILA 8827',
        memo: 'SYSCO CREDIT SHORTED DELIVERY',
        amountCents: -18420,
      }),
      { type: 'refund', category: 'Food & beverage', needsReview: false },
    )
    assert.deepEqual(
      classified({
        id: 'txn_1024',
        account: 'card',
        merchant: 'HOME DEPOT #4102',
        memo: 'HOME DEPOT RETURN',
        amountCents: -5999,
      }),
      { type: 'refund', category: 'Repairs & maintenance', needsReview: false },
    )
    assert.deepEqual(
      classified({
        id: 'txn_1036',
        account: 'card',
        merchant: 'WEBSTAURANT STORE',
        memo: 'WEBSTAURANT RETURN',
        amountCents: -21240,
      }),
      { type: 'refund', category: 'Smallwares & supplies', needsReview: false },
    )
  })

  it('sends an unknown-merchant refund to review', () => {
    assert.deepEqual(
      classified({
        id: 'txn_1037',
        account: 'card',
        merchant: 'AMZN MKTP US*7Q1P2',
        memo: 'AMAZON MARKETPLACE REFUND',
        amountCents: -4199,
      }),
      { type: 'refund', category: 'Uncategorized', needsReview: true },
    )
  })
})

describe('deposits', () => {
  it('classifies sales payouts as deposits and keeps the merchant category', () => {
    assert.deepEqual(
      classified({
        id: 'txn_1002',
        account: 'bank',
        merchant: 'DOORDASH PAYOUT',
        memo: 'DOORDASH INC PAYOUT',
        amountCents: -221045,
      }),
      { type: 'deposit', category: 'Delivery sales', needsReview: false },
    )
    assert.deepEqual(
      classified({
        id: 'txn_1004',
        account: 'bank',
        merchant: 'TOAST PAYOUT',
        memo: 'TOAST INC DAILY PAYOUT',
        amountCents: -612030,
      }),
      { type: 'deposit', category: 'Card sales', needsReview: false },
    )
  })

  it('does not classify txn_1040 as a deposit', () => {
    const result = classified({
      id: 'txn_1040',
      account: 'bank',
      merchant: 'TRANSFER FROM SAVINGS 8810',
      memo: 'ONLINE TRANSFER FROM SAVINGS 8810',
      amountCents: -500000,
    })
    assert.notEqual(result.type, 'deposit')
    assert.equal(result.type, 'transfer')
  })
})

describe('merchant matching', () => {
  it('matches a case-insensitive prefix of the merchant', () => {
    assert.equal(findMerchant('sysco phila 8827').category, 'Food & beverage')
    assert.equal(findMerchant('HOME DEPOT #4102').category, 'Repairs & maintenance')
    assert.equal(findMerchant('THE SYSCO STORE'), null)
  })

  it('maps MAINLINE PROPERTIES LLC to Rent', () => {
    assert.equal(findMerchant('MAINLINE PROPERTIES LLC').category, 'Rent')
  })

  it('never reads the memo when choosing a category', () => {
    assert.deepEqual(
      classified({
        merchant: 'AMZN MKTP US*2K4X9',
        memo: 'SYSCO PHILA 8827',
        amountCents: 8412,
      }),
      { type: 'purchase', category: 'Uncategorized', needsReview: true },
    )
    assert.deepEqual(
      classified({
        merchant: 'sysco phila 8827',
        memo: 'AMAZON MARKETPLACE',
        amountCents: 100,
      }),
      { type: 'purchase', category: 'Food & beverage', needsReview: false },
    )
  })
})
