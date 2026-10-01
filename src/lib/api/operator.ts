import { http, type Page } from "./client";
import type { MemberRow, QueueRow, Withdrawal } from "./types";

/**
 * The operator console's write routes. A decision's idempotency key is fixed
 * per withdrawal, so a retry after a lost response replays the stored answer
 * instead of deciding twice — rejecting an approved withdrawal refunds it, and
 * refunding twice is what the key prevents.
 */
export const operatorApi = {
  queue: (tenantId: string, status?: string) =>
    http.get<Page<QueueRow>>(`/api/tenants/${tenantId}/queue`, { status }),
  approve: (tenantId: string, withdrawalId: string) =>
    http.post<Withdrawal>(`/api/tenants/${tenantId}/queue/${withdrawalId}/approve`, {}, `approve:${withdrawalId}`),
  reject: (tenantId: string, withdrawalId: string, reason: string) =>
    http.post<Withdrawal>(`/api/tenants/${tenantId}/queue/${withdrawalId}/reject`, { reason }, `reject:${withdrawalId}`),

  members: (tenantId: string) => http.get<MemberRow[]>(`/api/tenants/${tenantId}/members`),
  invite: (tenantId: string, address: string, label?: string) =>
    http.post<MemberRow>(`/api/tenants/${tenantId}/members`, { address, label }),
  approveMember: (tenantId: string, address: string) =>
    http.post<MemberRow>(`/api/tenants/${tenantId}/members/${address}/approve`),
  block: (tenantId: string, address: string, reason?: string) =>
    http.post<MemberRow>(`/api/tenants/${tenantId}/members/${address}/block`, { reason }),
  unblock: (tenantId: string, address: string) =>
    http.post<MemberRow>(`/api/tenants/${tenantId}/members/${address}/unblock`),
};
