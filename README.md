# EXP-412 Story 1: Categorize transactions

Needs Node 18 or newer. No dependencies.

```
npm start -- transactions.csv > ledger_lines.csv
npm test
```

Each transaction id becomes one ledger line, using the row from the highest sync_batch. Lines come out in the order the ids first appear in the feed.

## Things I'd ask before merging

The transfer rule was the one I wasn't comfortable shipping as written. "Memo says PAYMENT" turns txn_1022, the rent payment, into a transfer, because its memo is "ACH PAYMENT MAINLINE PROPERTIES." It also wouldn't go to review, so nobody would notice. I match the four transfer phrases that actually show up in the feed instead, and a merchant on the list is never treated as a transfer. I'd want to know if there are other transfer memos out there. If one shows up, it lands in review, so at least it fails safe.

I'd also ask about amounts that change between syncs. txn_1046 went from $512.00 pending to $518.35 posted, and right now that change is silent. Should it be flagged? And what should happen to a pending charge that never posts?

Last one: I replace the whole row on re-sync. In this feed only the memo and amount ever change, but if the account or sign changed, the line would get reclassified. I think that's right, but I'd confirm.

## How I used AI

I used Claude to write most of the code and tests, and Claude in chat to review each step before moving on. Claude spotted the rent problem early, which was useful.

I pushed back in a few places. It wanted to match transfer legs across rows by date and amount. I didn't think it was needed, since the memo already tells you each row is a transfer, and matching breaks when the two legs post on different days. It also sorted ids as plain strings, which would put txn_999 after txn_1000, so I switched to keeping the feed order.

The thing I'm happiest I caught was a test that didn't prove anything. The rent test would pass even