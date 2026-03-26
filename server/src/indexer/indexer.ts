import * as StellarSdk from '@stellar/stellar-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.VITE_CONTRACT_ID || '';
const POLL_INTERVAL = 5000; // 5 seconds

const rpcServer = new StellarSdk.rpc.Server(RPC_URL);

/**
 * Filter for specific events from our Soroban Vault contract.
 * We parse the XDR and store it in PostgreSQL.
 */
export async function startIndexer() {
  console.log('[Indexer] Starting StellarYield event indexer...');

  // 1. Recover last processed ledger
  let state = await prisma.indexerState.findUnique({ where: { id: 'singleton' } });
  if (!state) {
    state = await prisma.indexerState.create({ data: { id: 'singleton', lastLedger: 0 } });
  }

  let startLedger = state.lastLedger;

  // 2. Indexer loop
  const poll = async () => {
    try {
      const latestLedger = await rpcServer.getLatestLedger();
      const endLedger = latestLedger.sequence;

      if (startLedger >= endLedger) {
        setTimeout(poll, POLL_INTERVAL);
        return;
      }

      console.log(`[Indexer] Catching up from ${startLedger} to ${endLedger}...`);

      const eventsResponse = await rpcServer.getEvents({
        startLedger: startLedger,
        filters: [
          {
            type: 'contract',
            contractIds: [CONTRACT_ID]
          }
        ],
        limit: 100
      });

      for (const event of eventsResponse.events) {
        // Parse topic (assume basic Symbol topic for now)
        const topic = event.topic.map(t => t.toXDR('base64')).join(':');
        const data = event.value.toXDR('base64');

        // Idempotent upsert
        await prisma.event.upsert({
          where: {
            txHash_topic_data: {
              txHash: event.txHash,
              topic: topic,
              data: data
            }
          },
          update: {},
          create: {
            ledger: event.ledger,
            txHash: event.txHash,
            contractId: event.contractId,
            topic: topic,
            data: data
          }
        });
      }

      // 3. Update state
      startLedger = endLedger;
      await prisma.indexerState.update({
        where: { id: 'singleton' },
        data: { lastLedger: startLedger }
      });

      console.log(`[Indexer] Successfully processed up to ledger ${startLedger}`);
      setTimeout(poll, POLL_INTERVAL);
    } catch (error) {
      console.error('[Indexer] Error:', error);
      setTimeout(poll, POLL_INTERVAL); // Retry
    }
  };

  poll();
}
