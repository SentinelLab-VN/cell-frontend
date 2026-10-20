import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { CHAIN_POLL_MS, keys, useBalances } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { moneyApi } from "@/lib/api/money";
import { ActivityList } from "./activity-list";
import { kindOf, type Filter } from "./activity-kind";

const FILTERS: TabItem<Filter>[] = [
  { value: "all", label: "All" },
  { value: "transfers", label: "Transfers" },
  { value: "deposits", label: "Deposits" },
  { value: "withdrawals", label: "Withdrawals" },
];

export function ActivityPage() {
  const tenant = useCurrentTenant();
  const [filter, setFilter] = useState<Filter>("all");
  const { data: balances } = useBalances(tenant.id);
  const activity = useQuery({
    queryKey: keys.activity(tenant.id),
    queryFn: () => moneyApi.activity(tenant.id),
    refetchInterval: CHAIN_POLL_MS,
  });

  const rows = (activity.data?.items ?? []).filter((row) => filter === "all" || kindOf(row).group === filter);

  return (
    <Page title="Activity" subtitle="Everything that moved, and where it is now">
      <Tabs value={filter} onChange={setFilter} items={FILTERS} className="mb-4" />

      {activity.isPending && <Skeleton className="h-48" />}
      {activity.isError && <ErrorState error={activity.error} />}
      {activity.data && rows.length === 0 && <EmptyState title="Nothing has moved yet" />}
      {rows.length > 0 && <ActivityList rows={rows} balances={balances} />}
    </Page>
  );
}
