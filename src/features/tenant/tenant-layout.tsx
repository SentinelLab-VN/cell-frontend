import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { ApiError } from "@/lib/api/client";
import type { Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
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
        {tenant.isError ? <LoadFailed error={tenant.error} /> : <Skeleton className="h-40" />}
      </div>
    </div>
  );
}

/**
 * An `open` tenant admits whoever opens it, so a 403 here means it is
 * `approval` or `invite_only` and somebody has to let this wallet in. Say so,
 * and give the way back, instead of a bare error.
 */
function LoadFailed({ error }: { error: unknown }) {
  const { address } = useRequiredSession();
  const status = error instanceof ApiError ? error.status : undefined;

  return (
    <div className="space-y-4">
      {status === 403 ? (
        <EmptyState title="You're not a member of this tenant yet">
          It only admits invited or approved wallets. Ask its operator to invite {shortAddress(address)}, then open this
          link again.
        </EmptyState>
      ) : status === 404 ? (
        <EmptyState title="This tenant doesn't exist">Check the link you were given.</EmptyState>
      ) : (
        <ErrorState error={error} title="Could not load this tenant" />
      )}
      <Link to="/home">
        <Button variant="outline">Back to your tenants</Button>
      </Link>
    </div>
  );
}
