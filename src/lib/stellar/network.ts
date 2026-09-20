import { rpc, TransactionBuilder } from "@stellar/stellar-sdk";

const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const EXPLORER = import.meta.env.VITE_EXPLORER_URL || "https://stellar.expert/explorer/testnet";

export const server = new rpc.Server(RPC_URL);

export const explorerTx = (hash: string) => `${EXPLORER}/tx/${hash}`;
export const explorerAccount = (address: string) => `${EXPLORER}/account/${address}`;
export const explorerContract = (id: string) => `${EXPLORER}/contract/${id}`;

export class ChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChainError";
  }
}

const POLL_MS = 1500;
const POLL_ATTEMPTS = 40;

/** Send a signed envelope and wait for it to settle. Resolves to its hash. */
export async function submitSigned(signedXdr: string, networkPassphrase: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
  const sent = await server.sendTransaction(tx);
  if (sent.status === "ERROR") {
    throw new ChainError("The network refused the transaction. If you waited a while, prepare it again.");
  }

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    const result = await server.getTransaction(sent.hash);
    if (result.status === "SUCCESS") return sent.hash;
    if (result.status === "FAILED") throw new ChainError("The transaction failed on chain.");
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new ChainError("The transaction has not confirmed yet. Check the explorer before trying again.");
}
