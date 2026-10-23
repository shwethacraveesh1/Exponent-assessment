const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const root = path.join(__dirname, '..')
const transactionsPath = path.join(__dirname, 'fixtures', 'transactions.csv')
const expectedPath = path.join(__dirname, 'fixtures', 'expected_first_15.csv')

// The fixture is CRLF. Compare logical lines so the CLI can write LF.
function logicalLines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
}

function runCli() {
  const result = spawnSync(
    process.execPath,
    [path.join(root, 'bin', 'categorize.js'), transactionsPath],
    { cwd: root, encoding: 'utf8' },
  )
  assert.equal(result.status, 0, result.stderr || String(result.error))
  return result.stdout
}

describe('golden', () => {
  it('the first 15 ledger lines match expected_first_15.csv exactly', () => {
    const expected = logicalLines(fs.readFileSync(expectedPath, 'utf8'))
    const output = logicalLines(runCli())
    assert.equal(expected.length, 16)
    assert.deepEqual(output.slice(0, expected.length), expected)
  })

  it('writes 56 ledger rows for the full feed', () => {
    const output = logicalLines(runCli())
    assert.equal(output.length - 1, 56)
  })
})
