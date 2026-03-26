#32 Implement Gasless Transactions (Fee Bumping) for User Onboarding
Repo Avatar
edehvictor/StellarYield
📝 Description
To onboard non-crypto native users, StellarYield will sponsor the transaction fees for their first deposit using Stellar's fee-bumping feature.

🎯 Acceptance Criteria
 Update the frontend transaction submission logic to utilize the FeeBumpTransaction wrapper.
 Create a secure backend endpoint where the protocol's server signs the inner transaction to pay the network fee.
 Implement rate-limiting and sybil resistance (e.g., only sponsor the first 3 transactions per IP/Wallet).
 Submit the final wrapped transaction to the network.
🛠 Technical Details
Stack: Node.js, Stellar SDK, React.
Location: /server/src/relayer/ and /client/src/services/
Security: Ensure the backend private key is never exposed and only signs fee-bumps, not arbitrary data.
⏱ Complexity & Scope
Drips Complexity: High (200 points)
Guidelines: Requires careful handling of keypairs and network submission. PR must include Closes #[issue_id].



#28 Build Stellar Horizon Event Indexer Service
Repo Avatar
edehvictor/StellarYield
📝 Description
Our backend needs to track all on-chain actions (deposits, withdrawals, harvests) in real-time to update the UI without forcing the frontend to query the blockchain for historical data.

🎯 Acceptance Criteria
 Build a background Node.js service using @stellar/stellar-sdk to listen to the Horizon API.
 Filter for specific events emitted by our Soroban Vault contract.
 Parse the XDR event data and store it securely in our relational database (e.g., PostgreSQL).
 Handle blockchain reorgs or connection drops gracefully by tracking the last processed ledger sequence.
🛠 Technical Details
Stack: Node.js, Stellar SDK, PostgreSQL/Prisma.
Location: /server/src/indexer/
⏱ Complexity & Scope
Drips Complexity: High (200 points)
Guidelines: Ensure the indexer is idempotent (processing the same ledger twice won't duplicate database entries). PR must include Closes #[issue_id].



#27 Emergency Circuit Breaker & Timelock Governance
Repo Avatar
edehvictor/StellarYield
📝 Description
Security is paramount. If a vulnerability is found in an underlying protocol, the admin must be able to pause deposits and rescue funds, but we also need a timelock to prevent malicious admin behavior.

🎯 Acceptance Criteria
 Implement an emergency_pause() function that halts all deposits and internal routing immediately.
 Implement a rescue_funds() function that allows the admin to pull funds back to the vault, bypassing standard withdrawal checks.
 Implement a 24-hour Timelock for any contract upgrades or changes to the admin address.
 Emit specific Soroban events when the circuit breaker is tripped.
🛠 Technical Details
Stack: Rust, Soroban SDK.
Location: /contracts/yield_vault/src/admin.rs
⏱ Complexity & Scope
Drips Complexity: High (200 points)
Guidelines: Test all edge cases of the timelock state. PR must include Closes #[issue_id].


#24 Implement Flash-Loan Resistant Price Oracle Integration
Repo Avatar
edehvictor/StellarYield
📝 Description
To safely calculate the value of LP tokens and user shares during deposits and withdrawals, the vault needs accurate asset pricing. Relying solely on spot prices from a DEX makes the vault vulnerable to flash-loan attacks. This issue integrates a secure price oracle.

🎯 Acceptance Criteria
 Integrate a Soroban-compatible Oracle (e.g., standard Stellar oracle standard) into the vault contract.
 Implement a Time-Weighted Average Price (TWAP) fallback calculation if the oracle is delayed.
 Ensure deposit and withdraw functions use these secure price feeds to calculate share minting/burning.
 Write tests simulating price manipulation attempts to prove the vault remains secure.
🛠 Technical Details
Stack: Rust, Soroban SDK.
Location: /contracts/yield_vault/src/oracle.rs
Security: Critical priority. Prevent mathematical underflows during price conversions.
⏱ Complexity & Scope
Drips Complexity: High (200 points)
Guidelines: Minimum 95% test coverage required. PR must include Closes #[issue_id].