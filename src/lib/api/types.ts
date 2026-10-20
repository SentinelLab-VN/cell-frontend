// Names for the API's shapes. Most come from the generated OpenAPI schema
// (`pnpm api:types`); the few routes the schema does not describe are typed by
// hand below, from what the gateway actually answers.

import type { components } from "./schema";

type Schema = components["schemas"];

export type Tenant = Schema["TenantResponse"];
export type TenantSummary = Schema["TenantSummary"];
export type TenantRole = Schema["TenantRole"];
export type ActivationState = Schema["ActivationState"];
export type MembershipPolicy = Schema["MembershipPolicy"];
export type Me = Schema["MeResponse"];
export type Config = Schema["ConfigResponse"];

export type Channel = Schema["ChannelResponse"];
export type BalanceRow = Schema["BalanceRow"];
export type TransferContext = Schema["TransferContextResponse"];
export type Overview = Schema["OverviewResponse"];
export type ChannelOverview = Schema["ChannelOverview"];
export type Contract = Schema["ContractResponse"];

export type QueueRow = Schema["QueueRow"];
export type WithdrawalStatus = Schema["WithdrawalStatus"];
export type MemberRow = Schema["MemberRow"];
export type MemberLabel = Schema["MemberLabel"];

/** An unsigned envelope for the wallet, with a sentence saying what it does. */
export type PreparedTx = Schema["XdrResponse"];

export interface DeployPending {
  txHash: string;
  message: string;
}

export interface DepositContext {
  escrowContractId: string;
  tokenContractId: string;
  assetCode: string;
  decimals: number;
  depositsBlocked: boolean;
  supportsRecipient: boolean;
}

export interface WithdrawalContext {
  channelId: string;
  decimals: number;
  spendable: string;
  releaseCap: string | null;
  withdrawalsBlocked: boolean;
  defaultDestination: string;
  requestId: string;
  expiresAt: string;
  networkPassphrase: string;
}

export interface Withdrawal {
  id: string;
  channelId: string;
  address: string;
  destination: string;
  amount: string;
  status: WithdrawalStatus;
  requestedAt: string;
  decidedAt: string | null;
  nonce: number | null;
  releaseTxHash: string | null;
  releasedAt: string | null;
  failureReason: string | null;
  decisionNote: string | null;
}

export type LedgerReason =
  | "deposit"
  | "transfer"
  | "withdrawal_hold"
  | "withdrawal_release"
  | "withdrawal_refund";

/** One line of the caller's journal. `amount` is signed: negative is money leaving. */
export interface ActivityRow {
  seq: number;
  channelId: string;
  amount: string;
  reason: LedgerReason;
  createdAt: string;
  transferId: string | null;
  depositId: string | null;
  withdrawalId: string | null;
}

export interface TransferOutcome {
  outcome: "committed";
  transfer: { id: string; amount: string; toAddress: string; committedAt: string };
}

/** `202`: the commit outran the gateway's wait. The transfer is still in flight. */
export interface TransferPending {
  id: string;
  status: "in_flight";
  message: string;
}

export interface Transfer {
  id: string;
  channelId: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  nonce: number;
  committedAt: string;
}

export interface AuditEntry {
  seq: number;
  actorAddress: string | null;
  actorRole: string;
  action: string;
  subjectKind: string | null;
  subjectId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** The caller's own referral code and its funnel (`/api/referrals/me`). */
export interface Referral {
  code: string;
  /** Wallets that signed in through this code. */
  signups: number;
  /** Of those, wallets that have made a deposit. */
  depositors: number;
}

export interface ReferralMember {
  address: string;
  attributedAt: string;
  firstDepositAt: string | null;
}
