import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CHAIN_POLL_MS, keys } from "@/features/tenant/queries";
import { operatorApi } from "@/lib/api/operator";
import { tenantsApi } from "@/lib/api/tenants";

export const useOverview = (tenantId: string) =>
  useQuery({
    queryKey: keys.overview(tenantId),
    queryFn: () => tenantsApi.overview(tenantId),
    refetchInterval: CHAIN_POLL_MS,
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
