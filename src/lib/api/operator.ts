import { http, type Page } from "./client";
import type { MemberRow, QueueRow } from "./types";

/** The operator console's write routes. Each decision carries an idempotency key. */
export const operatorApi = {
  queue: (tenantId: string, status?: string) =>
    http.get<Page<QueueRow>>(`/api/tenants/${tenantId}/queue`, { status }),
  approve: (tenantId: string, withdrawalId: string) =>
    http.post<QueueRow>(`/api/tenants/${tenantId}/queue/${withdrawalId}/approve`, {}, crypto.randomUUID()),
  reject: (tenantId: string, withdrawalId: string, reason: string) =>
    http.post<QueueRow>(`/api/tenants/${tenantId}/queue/${withdrawalId}/reject`, { reason }, crypto.randomUUID()),

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
