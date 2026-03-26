# PR Description

This PR implements four major features/fixes for the StellarYield platform:

## 1. Gasless Transactions (Fee Bumping) - #32
Implemented a sponsor-led onboarding flow where the protocol pays for the first 3 transactions of a new user.
- **Backend**: Created a secure `/api/relayer/fee-bump` endpoint with rate-limiting (3 requests per IP/15m) to sign FeeBumpTransactions.
- **Frontend**: Updated the Soroban service to support wrapping transactions in a FeeBump wrapper before submission.
- **Closes #32**

## 2. Horizon Event Indexer Service - #28
Built a background Node.js service to track on-chain vault actions in real-time.
- **Features**: Idempotent processing using unique database constraints (PostgreSQL via Prisma), reorg handling by tracking the last processed ledger, and XDR parsing for event topics/data.
- **Location**: `/server/src/indexer/`
- **Closes #28**

## 3. Emergency Circuit Breaker & Timelock Governance - #27
Enhanced security with a programmable pause mechanism and admin timelocks.
- **Circuit Breaker**: `emergency_pause()` and `emergency_unpause()` to immediately halt deposits and rebalancing.
- **Rescue Funds**: `rescue_funds()` for emergency admin withdrawals.
- **Timelock**: Implemented a 24-hour timelock for admin changes to prevent governance attacks.
- **Closes #27**

## 4. Flash-Loan Resistant Price Oracle - #24
Integrated a secure price oracle with TWAP fallback to protect against price manipulation during share calculations.
- **Oracle Integration**: Direct fetching from a Soroban-compatible oracle.
- **TWAP Fallback**: Automated fallback to Time-Weighted Average Price if the oracle feed is stale or delayed.
- **Location**: `/contracts/yield_vault/src/oracle.rs`
- **Closes #24**

---
Tested with local Soroban simulations and unit tests in `contracts/yield_vault/src/lib.rs`.
