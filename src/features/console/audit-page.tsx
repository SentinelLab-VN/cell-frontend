import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/layout/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { AddressText } from "@/components/ui/text";
import { keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { tenantsApi } from "@/lib/api/tenants";
import { clockTime } from "@/lib/format";

export function AuditPage() {
  const tenant = useCurrentTenant();
  const audit = useQuery({ queryKey: keys.audit(tenant.id), queryFn: () => tenantsApi.audit(tenant.id) });
  const rows = audit.data?.items ?? [];

  return (
    <Page title="Audit log" subtitle="Every decision made in this console, and who made it">
      {audit.isPending && <Skeleton className="h-48" />}
      {audit.isError && <ErrorState error={audit.error} />}
      {audit.data && rows.length === 0 && <EmptyState title="Nothing recorded yet" />}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/60">
              <tr className="num text-[10px] tracking-[0.2em] text-dim uppercase">
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">By</th>
                <th className="px-5 py-3 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.seq} className="border-t border-border text-sm">
                  <td className="num px-5 py-3.5 text-foreground">{entry.action}</td>
                  <td className="px-5 py-3.5">
                    {entry.actorAddress ? <AddressText address={entry.actorAddress} /> : <span className="text-dim">{entry.actorRole}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-muted-foreground">{clockTime(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
