import { ArrowDownLeft, Layers } from "lucide-react";
import { Link } from "react-router-dom";
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
        This wallet does not hold a balance in any channel, and does not run one. Both are one step away — and neither
        needs an account.
      </p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
        <Card>
          <ArrowDownLeft className="size-5 text-info" aria-hidden />
          <h2 className="mt-4 text-[15px] font-semibold text-foreground">Someone is going to pay me</h2>
          <p className="mt-2 mb-5 text-[13px] leading-relaxed text-muted-foreground">
            Give them this address. The moment their transfer settles, the balance is yours and this screen becomes
            your tenant list. No invite, no claim.
          </p>
          <ReadOnlyBox trailing={<CopyButton value={address} label="Copy address" />}>{shortAddress(address, 6)}</ReadOnlyBox>
        </Card>

        <Card className="flex flex-col">
          <Layers className="size-5 text-primary" aria-hidden />
          <h2 className="mt-4 text-[15px] font-semibold text-foreground">I want to run a channel</h2>
          <p className="mt-2 mb-5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
            Deploy an escrow you own, open the assets you want to support, and let your users hold balances backed by
            it. This is the business side.
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
