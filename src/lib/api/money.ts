import { http, type Page } from "./client";
import type {
  ActivityRow,
  BalanceRow,
  DepositContext,
  TransferContext,
  TransferOutcome,
  Withdrawal,
  WithdrawalContext,
} from "./types";

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
  transfer: (tenantId: string, channelId: string, transfer: SignedTransfer) =>
    http.post<TransferOutcome>(`/api/tenants/${tenantId}/channels/${channelId}/transfers`, transfer),

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
