import { Address, BASE_FEE, Contract, nativeToScVal, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { server } from "./network";

interface DepositInput {
  escrowContractId: string;
  tokenContractId: string;
  from: string;
  /** Who is credited inside the channel. Defaults to `from`. */
  recipient?: string;
  amount: string;
  networkPassphrase: string;
}

/**
 * The unsigned `deposit(from, mint, amount, recipient)` call on the escrow. A
 * deposit is between the user and the chain — the backend only ever observes it
 * — so the app builds this one itself.
 */
export async function buildDeposit(input: DepositInput): Promise<string> {
  const account = await server.getAccount(input.from);
  const recipient =
    input.recipient && input.recipient !== input.from
      ? new Address(input.recipient).toScVal()
      : xdr.ScVal.scvVoid();

  const call = new Contract(input.escrowContractId).call(
    "deposit",
    new Address(input.from).toScVal(),
    new Address(input.tokenContractId).toScVal(),
    nativeToScVal(BigInt(input.amount), { type: "i128" }),
    recipient,
  );

  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: input.networkPassphrase })
    .addOperation(call)
    .setTimeout(120)
    .build();

  return (await server.prepareTransaction(tx)).toXDR();
}
