import { ApiError, http, type Page } from "./client";
import type {
  ActivityRow,
  BalanceRow,
  DepositContext,
  Transfer,
  TransferContext,
  TransferOutcome,
  TransferPending,
  Withdrawal,
  WithdrawalContext,
} from "./types";

export type TransferResult = { kind: "committed"; outcome: TransferOutcome } | { kind: "pending"; pending: TransferPending };

interface SignedTransfer {
  to: string;
  amount: string;
  nonce: number;
  expiresAt: string;
  signature: string;
}

interface SignedWithdrawal {
  amount: string;
  destination: string;
  requestId: string;
  expiresAt: string;
  signature: string;
}

export const moneyApi = {
  balances: (tenantId: string) => http.get<BalanceRow[]>(`/api/tenants/${tenantId}/balances`),
  activity: (tenantId: string) => http.get<Page<ActivityRow>>(`/api/tenants/${tenantId}/activity`),

  depositContext: (tenantId: string, channelId: string) =>
    http.get<DepositContext>(`/api/tenants/${tenantId}/channels/${channelId}/deposit-context`),

  transferContext: (tenantId: string, channelId: string, to?: string) =>
    http.get<TransferContext>(`/api/tenants/${tenantId}/channels/${channelId}/transfer-context`, { to }),
  recipients: (tenantId: string, channelId: string) =>
    http.get<string[]>(`/api/tenants/${tenantId}/channels/${channelId}/recipients`),
  /** `202` is not a result: the caller polls `getTransfer` until the row exists or the expiry has passed. */
  transfer: async (tenantId: string, channelId: string, transfer: SignedTransfer): Promise<TransferResult> => {
    const { status, data } = await http.postWithStatus<TransferOutcome | TransferPending>(
      `/api/tenants/${tenantId}/channels/${channelId}/transfers`,
      transfer,
    );
    return status === 202
      ? { kind: "pending", pending: data as TransferPending }
      : { kind: "committed", outcome: data as TransferOutcome };
  },
  /** By id or by signature; `null` while it has not committed. */
  getTransfer: async (tenantId: string, idOrSignature: string): Promise<Transfer | null> => {
    try {
      return await http.get<Transfer>(`/api/tenants/${tenantId}/transfers/${idOrSignature}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  withdrawalContext: (tenantId: string, channelId: string) =>
    http.get<WithdrawalContext>(`/api/tenants/${tenantId}/channels/${channelId}/withdrawal-context`),
  withdrawals: (tenantId: string) => http.get<Page<Withdrawal>>(`/api/tenants/${tenantId}/withdrawals`),
  requestWithdrawal: (tenantId: string, channelId: string, withdrawal: SignedWithdrawal) =>
    http.post<Withdrawal>(
      `/api/tenants/${tenantId}/channels/${channelId}/withdrawals`,
      withdrawal,
      withdrawal.requestId,
    ),
  cancelWithdrawal: (tenantId: string, withdrawalId: string) =>
    http.post<Withdrawal>(`/api/tenants/${tenantId}/withdrawals/${withdrawalId}/cancel`),
};
