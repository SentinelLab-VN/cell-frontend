import { Copy, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBalances } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { useDismissed } from "./helpers";

/** What an operator should set up between the escrow going live and the first deposit. */
export function OperatorNextSteps({ hasDeposits }: { hasDeposits: boolean }) {
  const tenant = useCurrentTenant();
  const balances = useBalances(tenant.id);
  const [dismissed, dismiss] = useDismissed(`cell:operator-guide-dismissed:${tenant.id}`);

  if (dismissed || tenant.status !== "active" || hasDeposits) return null;

  const userLink = `${window.location.origin}/t/${tenant.id}`;

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground">Your escrow is live. Three things next.</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Nobody has deposited yet, so this is the moment to set the rules.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide these steps"
          className="rounded-lg p-1.5 text-dim transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <ol className="mt-5 space-y-2.5">
        <Step
          n={1}
          title="Give your users the link"
          body={
            tenant.membershipPolicy === "open"
              ? "Anyone who opens it joins this tenant and can deposit."
              : "They join once you invite or approve them on the Accounts screen."
          }
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              navigator.clipboard
                .writeText(userLink)
                .then(() => toast.success("Link copied"))
                .catch(() => toast.error(`Could not copy. The link is ${userLink}`));
            }}
          >
            <Copy className="size-4" aria-hidden /> Copy link
          </Button>
        </Step>

        <Step
          n={2}
          title="Decide who may hold money here"
          body={`This tenant is "${tenant.membershipPolicy}". Invite-only and approval both hold a newcomer's deposit until you let them in.`}
        >
          <Link to={`/t/${tenant.id}/console/accounts`}>
            <Button size="sm" variant="secondary">Accounts</Button>
          </Link>
        </Step>

        <Step
          n={3}
          title="Set the largest single payout"
          body={
            balances.data?.length
              ? "It caps what one compromised operator signature can move in a single transaction."
              : "Open an asset first, then cap what one payout may move."
          }
        >
          <Link to={`/t/${tenant.id}/console/channels`}>
            <Button size="sm" variant="secondary">Channels</Button>
          </Link>
        </Step>
      </ol>

      <p className="mt-4 text-[15px] text-muted-foreground">
        The escrow pays out with the operator key Cell derives for this tenant — keep its account funded, and watch it
        on the Contract screen.
      </p>
    </Card>
  );
}

function Step({ n, title, body, children }: { n: number; title: string; body: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-background px-4 py-3.5">
      <span className="num flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] text-muted-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <div className="ml-auto">{children}</div>
    </li>
  );
}
