import { ArrowDownLeft, Layers } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReadOnlyBox } from "@/components/ui/field";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { CopyButton } from "@/components/ui/text";
import { useRequiredSession } from "@/features/session/use-session";
import { useConfig, useMe } from "@/features/tenant/queries";
import { shortAddress } from "@/lib/format";
import { TenantRow } from "./tenant-row";

export function HomePage() {
  const session = useRequiredSession();
  const me = useMe();
  // Someone who chose "I run a channel" and has none yet goes straight to the wizard.
  const intent = (useLocation().state as { intent?: string } | null)?.intent;
  if (intent === "operator" && me.data?.tenants.length === 0) return <Navigate to="/tenants/new" replace />;

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="mx-auto w-full max-w-[760px] px-6 py-14">
        {me.isPending && <Skeleton className="h-64" />}
        {me.isError && <ErrorState error={me.error} />}
        {me.data &&
          (me.data.tenants.length === 0 ? (
            <NothingYet address={session.address} />
          ) : (
            <>
              <h1 className="text-[30px] font-semibold tracking-tight text-foreground">Your tenants</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">
                One wallet, many roles. This is what {shortAddress(session.address)} is connected to.
              </p>
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
    <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
      <div>
        <p className="text-sm font-medium text-foreground">Run your own channel</p>
        <p className="mt-0.5 text-[13px] text-dim">Deploy an escrow you control and open it to your users</p>
      </div>
      <Link to="/tenants/new">
        <Button variant="outline">Create a tenant</Button>
      </Link>
    </div>
  );
}

/** A wallet nobody has paid yet, which runs nothing. Both are one step away. */
function NothingYet({ address }: { address: string }) {
  const { data: config } = useConfig();
  return (
    <div className="pt-24 text-center">
      <h1 className="text-[30px] font-semibold tracking-tight text-foreground">Nothing here yet</h1>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        This wallet does not hold a balance in any channel, and does not run one. A channel has to exist before anyone
        can deposit into it — so either open the link of one that does, or set one up and share yours.
      </p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
        <Card>
          <ArrowDownLeft className="size-5 text-info" aria-hidden />
          <h2 className="mt-4 text-[15px] font-semibold text-foreground">Someone already runs a channel</h2>
          <p className="mt-2 mb-5 text-[13px] leading-relaxed text-muted-foreground">
            Open the link they sent you and it appears here. Or give them this address: the moment their transfer
            settles, the balance is yours and this screen becomes your tenant list.
          </p>
          <ReadOnlyBox trailing={<CopyButton value={address} label="Copy address" />}>{shortAddress(address, 6)}</ReadOnlyBox>
        </Card>

        <Card className="flex flex-col">
          <Layers className="size-5 text-primary" aria-hidden />
          <h2 className="mt-4 text-[15px] font-semibold text-foreground">I want to run a channel</h2>
          <p className="mt-2 mb-5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
            Deploy an escrow you own and open the asset it holds — a short wizard, a few signatures. When it is live
            you get a link; whoever opens it can deposit and hold a balance backed by your escrow.
          </p>
          <Link to="/tenants/new">
            <Button block size="lg">
              Create a tenant
            </Button>
          </Link>
          {config?.tenantCreation === "allowlist" && (
            <p className="mt-3 text-xs text-dim">This deployment lists who may create tenants.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
