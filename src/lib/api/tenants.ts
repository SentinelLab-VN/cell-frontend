import { http, type Page } from "./client";
import type {
  AuditEntry,
  Config,
  Contract,
  DeployPending,
  Me,
  MembershipPolicy,
  Overview,
  PreparedTx,
  Tenant,
} from "./types";

export type CreateTenantResult = { kind: "created"; tenant: Tenant } | { kind: "pending"; pending: DeployPending };

export const tenantsApi = {
  config: () => http.get<Config>("/api/config"),
  me: () => http.get<Me>("/api/me"),

  prepareDeploy: () => http.post<PreparedTx>("/api/tenants/prepare"),

  /**
   * One request that deploys the escrow and registers the tenant. `202` means
   * "not finished, not failed": sending the very same request again is safe and
   * is what finishes it.
   */
  create: async (name: string, signedXdr: string): Promise<CreateTenantResult> => {
    const { status, data } = await http.postWithStatus<Tenant | DeployPending>("/api/tenants", { name, signedXdr });
    return status === 202
      ? { kind: "pending", pending: data as DeployPending }
      : { kind: "created", tenant: data as Tenant };
  },

  get: (tenantId: string) => http.get<Tenant>(`/api/tenants/${tenantId}`),
  setPolicy: (tenantId: string, membershipPolicy: MembershipPolicy) =>
    http.patch<Tenant>(`/api/tenants/${tenantId}`, { membershipPolicy }),

  overview: (tenantId: string) => http.get<Overview>(`/api/tenants/${tenantId}/overview`),
  contract: (tenantId: string) => http.get<Contract>(`/api/tenants/${tenantId}/contract`),
  audit: (tenantId: string) => http.get<Page<AuditEntry>>(`/api/tenants/${tenantId}/audit`),
};
