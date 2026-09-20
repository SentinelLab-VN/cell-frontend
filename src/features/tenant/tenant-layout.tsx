import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { ErrorState, Skeleton } from "@/components/ui/states";
import type { Tenant } from "@/lib/api/types";
import { useTenant } from "./queries";

/** Loads the tenant named in the URL, then hands it to `children`. */
export function TenantLoader({ children }: { children: (tenant: Tenant) => ReactNode }) {
  const { tenantId = "" } = useParams();
  const tenant = useTenant(tenantId);

  if (tenant.data) return <>{children(tenant.data)}</>;
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-xl px-6 py-16">
        {tenant.isError ? <ErrorState error={tenant.error} /> : <Skeleton className="h-40" />}
      </div>
    </div>
  );
}
