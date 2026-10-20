import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CHAIN_POLL_MS, keys } from "@/features/tenant/queries";
import { referralApi } from "@/lib/api/auth";
import { operatorApi } from "@/lib/api/operator";
import { tenantsApi } from "@/lib/api/tenants";

/**
 * `poll: false` reads whatever the Overview page already fetched without
 * scheduling its own refetches, so a passive consumer (the nav badge) adds no
 * requests on pages that never showed the overview.
 */
export const useOverview = (tenantId: string, { poll = true } = {}) =>
  useQuery({
    queryKey: keys.overview(tenantId),
    queryFn: () => tenantsApi.overview(tenantId),
    refetchInterval: poll ? CHAIN_POLL_MS : false,
  });

export const useContract = (tenantId: string) =>
  useQuery({
    queryKey: keys.contract(tenantId),
    queryFn: () => tenantsApi.contract(tenantId),
    refetchInterval: CHAIN_POLL_MS,
  });

export const useQueue = (tenantId: string) =>
  useQuery({
    queryKey: keys.queue(tenantId),
    queryFn: () => operatorApi.queue(tenantId),
    refetchInterval: CHAIN_POLL_MS,
  });

export const useMembers = (tenantId: string) =>
  useQuery({ queryKey: keys.members(tenantId), queryFn: () => operatorApi.members(tenantId) });

/** Everything under a tenant shares the `["tenant", id]` prefix, so one call refreshes it all. */
export function useRefreshTenant(tenantId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
}

// The referral code belongs to the wallet, not the tenant: no tenant prefix.
export const useMyReferral = () => useQuery({ queryKey: keys.referral, queryFn: referralApi.mine });

export const useMyReferralMembers = (enabled: boolean) =>
  useQuery({ queryKey: keys.referralMembers, queryFn: referralApi.members, enabled });
