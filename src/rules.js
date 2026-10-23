const merchants = [
  { prefix: 'SYSCO', category: 'Food & beverage' },
  { prefix: 'US FOODS', category: 'Food & beverage' },
  { prefix: 'RESTAURANT DEPOT', category: 'Food & beverage' },
  { prefix: 'METRO GAS & ELECTRIC', category: 'Utilities' },
  { prefix: 'CITY WATER DEPT', category: 'Utilities' },
  { prefix: 'COMCAST BUSINESS', category: 'Utilities' },
  { prefix: 'HOME DEPOT', category: 'Repairs & maintenance' },
  { prefix: 'ECOLAB', category: 'Cleaning & supplies' },
  { prefix: 'WEBSTAURANT STORE', category: 'Smallwares & supplies' },
  { prefix: 'GUSTO', category: 'Payroll' },
  { prefix: 'INDEED', category: 'Hiring' },
  { prefix: '7SHIFTS', category: 'Software' },
  { prefix: 'MAINLINE PROPERTIES', category: 'Rent' },
  { prefix: 'TOAST PAYOUT', category: 'Card sales' },
  { prefix: 'DOORDASH PAYOUT', category: 'Delivery sales' },
  { prefix: 'UBER EATS PAYOUT', category: 'Delivery sales' },
]

const transferPatterns = [
  'PAYMENT TO CARD',
  'PAYMENT - THANK YOU',
  'TRANSFER TO SAVINGS',
  'TRANSFER FROM SAVINGS',
]

function findMerchant(name) {
  const upper = name.toUpperCase()
  return merchants.find((merchant) => upper.startsWith(merchant.prefix)) || null
}

module.exports = { merchants, transferPatterns, findMerchant }
