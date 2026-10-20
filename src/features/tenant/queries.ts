import { useQuery } from "@tanstack/react-query";
import { channelsApi } from "@/lib/api/channels";
import { moneyApi } from "@/lib/api/money";
import { tenantsApi } from "@/lib/api/tenants";

// One place for query keys, so an invalidation can never miss by a typo.
export const keys = {
  config: ["config"] as const,
  me: ["me"] as const,
  tenant: (id: string) => ["tenant", id] as const,
  channels: (id: string) => ["tenant", id, "channels"] as const,
  balances: (id: string) => ["tenant", id, "balances"] as const,
  activity: (id: string) => ["tenant", id, "activity"] as const,
  withdrawals: (id: string) => ["tenant", id, "withdrawals"] as const,
  overview: (id: string) => ["tenant", id, "overview"] as const,
  contract: (id: string) => ["tenant", id, "contract"] as const,
  queue: (id: string) => ["tenant", id, "queue"] as const,
  members: (id: string) => ["tenant", id, "members"] as const,
  audit: (id: string) => ["tenant", id, "audit"] as const,
  referral: ["referral", "me"] as const,
  referralMembers: ["referral", "me", "members"] as const,
};

/** What arrives from the chain shows up through the indexer, a few seconds later: those screens poll. */
export const CHAIN_POLL_MS = 4000;

export const useConfig = () =>
  useQuery({ queryKey: keys.config, queryFn: tenantsApi.config, staleTime: Number.POSITIVE_INFINITY });

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: tenantsApi.me });

export const useTenant = (tenantId: string, poll = false) =>
  useQuery({
    queryKey: keys.tenant(tenantId),
    queryFn: () => tenantsApi.get(tenantId),
    refetchInterval: poll ? CHAIN_POLL_MS : false,
  });

export const useChannels = (tenantId: string) =>
  useQuery({ queryKey: keys.channels(tenantId), queryFn: () => channelsApi.list(tenantId) });

export const useBalances = (tenantId: string, poll = false) =>
  useQuery({
    queryKey: keys.balances(tenantId),
    queryFn: () => moneyApi.balances(tenantId),
    refetchInterval: poll ? CHAIN_POLL_MS : false,
  });
