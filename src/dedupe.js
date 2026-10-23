function dedupe(rows) {
  const byId = new Map()
  for (const row of rows) {
    const current = byId.get(row.id)
    if (!current || row.syncBatch >= current.syncBatch) byId.set(row.id, row)
  }
  return [...byId.values()]
}

module.exports = { dedupe }
