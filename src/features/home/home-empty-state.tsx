import { ArrowDownLeft, ArrowRight, Layers, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReadOnlyBox } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/text";
import { useConfig } from "@/features/tenant/queries";
import { shortAddress } from "@/lib/format";

function IconTile({ tone, children }: { tone: "info" | "primary"; children: React.ReactNode }) {
  return (
    <span
      className={
        tone === "info"
          ? "flex size-9 items-center justify-center rounded-[10px] bg-info-subtle text-info"
          : "flex size-9 items-center justify-center rounded-[10px] bg-primary-subtle text-primary-ink"
      }
    >
      {children}
    </span>
  );
}

/** A wallet nobody has paid yet, which runs nothing. Both are one step away. */
export function NothingYet({ address }: { address: string }) {
  const { data: config } = useConfig();
  return (
    <div className="pt-8 text-center lg:pt-16">
      <img src="/logo.png" alt="" aria-hidden width={48} height={48} className="mx-auto size-12 object-contain opacity-60" />
      <h1 className="mt-6 text-[36px] font-semibold tracking-[-0.025em] text-foreground">Nothing here yet</h1>
      <p className="mx-auto mt-3 max-w-[560px] text-[17px] leading-[1.65] text-muted-foreground">
        This wallet does not hold a balance in any channel, and does not run one. A channel has to exist before anyone
        can deposit into it — so either open the link of one that does, or set one up and share yours.
      </p>

      <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
        <Card className="flex flex-col">
          <IconTile tone="info">
            <ArrowDownLeft className="size-[18px]" aria-hidden />
          </IconTile>
          <h2 className="mt-4 text-base font-semibold text-foreground">Someone already runs a channel</h2>
          <p className="mt-2 mb-5 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
            Open the link they sent you and it appears here. Or give them this address: the moment their transfer
            settles, the balance is yours and this screen becomes your tenant list.
          </p>
          <ReadOnlyBox trailing={<CopyButton value={address} label="Copy address" />}>{shortAddress(address, 6)}</ReadOnlyBox>
        </Card>

        <Card className="flex flex-col">
          <IconTile tone="primary">
            <Layers className="size-[18px]" aria-hidden />
          </IconTile>
          <h2 className="mt-4 text-base font-semibold text-foreground">I want to run a channel</h2>
          <p className="mt-2 mb-5 flex-1 text-[15px] leading-[1.6] text-muted-foreground">
            Deploy an escrow you own and open the asset it holds — a short wizard, a few signatures. When it is live
            you get a link; whoever opens it can deposit and hold a balance backed by your escrow.
          </p>
          <Link to="/tenants/new" className="ml-auto max-md:w-full">
            <Button block size="lg" className="h-[46px] max-md:h-[52px]">
              Create a tenant
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
          {config?.tenantCreation === "allowlist" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-[13px] shrink-0" aria-hidden />
              This deployment lists who may create tenants.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
