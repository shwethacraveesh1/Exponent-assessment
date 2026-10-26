const SPLITS = {
    txn_1013: [
        {share:1, category: null},
        {share: 1, category: 'Food & beverage'},
        {share: 1, category: 'Transportation'},
    ]
}

function splitByPercentage(totalCents, percents) {
    const parts = []
    let allocatedCents = 0
    percents.forEach((percent, i) => {
        const isLast = i === percents.length - 1
        const amount = isLast ? totalCents - allocatedCents : Math.floor((totalCents * percent) / 100)
        parts.push(amount)
        allocatedCents += amount
    })
    return parts
} 

function applySplits(line) {
    const splits = SPLITS[line.transactionId]
    if (!splits) return line
    const amounts = splitByShares(line.amountCents, splits.map(s => s.share))
    return splits.map((s, i) => ({
        ...line,
        amountCents: amounts[i],
        category: s.category,
    }))
}

function splitByShares(totalCents, shares) {
    const totalShares = shares.reduce((acc, s) => acc + s, 0)
    const parts = shares.map(s => Math.floor((totalCents * s) / totalShares))

    let leftOver = totalCents - parts.reduce((acc, p) => acc + p, 0)
    const step = Math.sign(leftOver)
    for(let i =0; leftOver !== 0; i++) {
        parts[i % shares.length] += step
        leftOver -= step
    }
    return parts
}

module.exports = { splitByPercentage, applySplits }