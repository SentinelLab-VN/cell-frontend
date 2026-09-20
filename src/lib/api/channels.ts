import { http } from "./client";
import type { Channel, PreparedTx } from "./types";

interface OpenAssetInput {
  assetCode: string;
  assetIssuer?: string;
  tokenContractId: string;
  /** Stroops. Omitted or "0" means uncapped. */
  releaseCap?: string;
}

interface Gates {
  depositsBlocked: boolean;
  withdrawalsBlocked: boolean;
}

/** Every `prepare*` answers an unsigned envelope. The admin's wallet signs and submits it. */
export const channelsApi = {
  list: (tenantId: string) => http.get<Channel[]>(`/api/tenants/${tenantId}/channels`),

  open: (tenantId: string, input: OpenAssetInput) =>
    http.post<{ channel: Channel; tx: PreparedTx }>(`/api/tenants/${tenantId}/channels`, input),

  /** `allow_mint` again: changes the cap, and re-issues the envelope for an asset that was opened but never confirmed. */
  prepareSetCap: (tenantId: string, channelId: string, releaseCap: string) =>
    http.post<PreparedTx>(`/api/tenants/${tenantId}/channels/${channelId}/tx/set-cap`, { releaseCap }),

  prepareGates: (tenantId: string, channelId: string, gates: Gates) =>
    http.post<PreparedTx>(`/api/tenants/${tenantId}/channels/${channelId}/tx/set-gates`, gates),

  prepareAddOperator: (tenantId: string, operator: string) =>
    http.post<PreparedTx>(`/api/tenants/${tenantId}/tx/add-operator`, { operator }),

  prepareRemoveOperator: (tenantId: string, operator: string) =>
    http.post<PreparedTx>(`/api/tenants/${tenantId}/tx/remove-operator`, { operator }),

  prepareFundOperator: (tenantId: string, amountStroops: string) =>
    http.post<PreparedTx>(`/api/tenants/${tenantId}/tx/fund-operator`, { amount: amountStroops }),
};
