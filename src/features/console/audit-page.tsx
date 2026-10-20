import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/layout/page";
import { ScrollText } from "lucide-react";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { TableWrap, Td, Th, THead, Tr } from "@/components/ui/table";
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
      {audit.isPending && <Skeleton className="h-64 rounded-2xl" />}
      {audit.isError && <ErrorState error={audit.error} />}
      {audit.data && rows.length === 0 && <EmptyState icon={<ScrollText className="size-5" aria-hidden />} title="Nothing recorded yet" />}

      {rows.length > 0 && (
        <TableWrap>
          <THead>
            <tr>
              <Th>Action</Th>
              <Th>By</Th>
              <Th className="text-right">When</Th>
            </tr>
          </THead>
          <tbody>
            {rows.map((entry) => (
              <Tr key={entry.seq}>
                <Td className="num text-[15px]">{entry.action}</Td>
                <Td>
                  {entry.actorAddress ? (
                    <AddressText address={entry.actorAddress} className="text-[15px]" />
                  ) : (
                    <span className="text-dim">{entry.actorRole}</span>
                  )}
                </Td>
                <Td className="text-right text-[15px] text-muted-foreground">{clockTime(entry.createdAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </Page>
  );
}
