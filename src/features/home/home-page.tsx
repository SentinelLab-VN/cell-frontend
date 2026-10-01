import { Plus } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { useMe } from "@/features/tenant/queries";
import { shortAddress } from "@/lib/format";
import { NothingYet } from "./home-empty-state";
import { TenantRow } from "./tenant-row";

/** "1 tenant" / "3 tenants": the counter reads as a sentence fragment, so it must agree in number. */
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function HomePage() {
  const session = useRequiredSession();
  const me = useMe();
  // Someone who chose "I run a channel" and has none yet goes straight to the wizard.
  const intent = (useLocation().state as { intent?: string } | null)?.intent;
  if (intent === "operator" && me.data?.tenants.length === 0) return <Navigate to="/tenants/new" replace />;

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto w-full max-w-[880px] px-5 py-6 md:px-10 md:py-16">
        {me.isPending && <Skeleton className="h-64" />}
        {me.isError && <ErrorState error={me.error} title="Could not load your tenants" />}
        {me.data &&
          (me.data.tenants.length === 0 ? (
            <NothingYet address={session.address} />
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 max-md:flex-col max-md:items-start">
                <div>
                  <h1 className="text-[36px] font-semibold tracking-[-0.025em] text-foreground">Your tenants</h1>
                  <p className="mt-2 text-[17px] text-muted-foreground">
                    One wallet, many roles. This is what <span className="num text-foreground">{shortAddress(session.address)}</span> is
                    connected to.
                  </p>
                </div>
                <p className="num shrink-0 text-xs text-dim">
                  {plural(me.data.tenants.length, "tenant")} · {plural(new Set(me.data.tenants.map((t) => t.role)).size, "role")}
                </p>
              </div>
              <ul className="mt-8 space-y-3">
                {me.data.tenants.map((tenant) => (
                  <li key={tenant.id}>
                    <TenantRow tenant={tenant} />
                  </li>
                ))}
              </ul>
              <CreateTenantFooter />
            </>
          ))}
      </div>
    </div>
  );
}

function CreateTenantFooter() {
  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6 max-md:flex-col max-md:items-start">
      <div>
        <p className="text-sm font-semibold text-foreground">Run your own channel</p>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Deploy an escrow you control and open it to your users</p>
      </div>
      <Link to="/tenants/new" className="max-md:w-full">
        <Button variant="outline" className="max-md:h-11 max-md:w-full">
          <Plus className="size-[15px]" aria-hidden />
          Create a tenant
        </Button>
      </Link>
    </div>
  );
}
