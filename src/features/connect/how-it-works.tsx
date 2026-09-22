import { ArrowDownToLine, ArrowUpFromLine, ExternalLink, Send, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

const STEPS: { icon: ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    icon: ArrowDownToLine,
    title: "Deposit once",
    body: "Your wallet signs one Stellar transaction. The asset goes into an escrow contract you can read on chain, and the same amount is credited to you inside the channel.",
  },
  {
    icon: Send,
    title: "Transfer as often as you like",
    body: "Payments between members are settled off chain by the operator: instant, free, and invisible to anyone watching Stellar. Only you and the operator see them.",
  },
  {
    icon: ArrowUpFromLine,
    title: "Withdraw when you want out",
    body: "You sign a withdrawal request. The operator approves it and the escrow pays your wallet on chain — proving to the contract that this withdrawal has never been paid before.",
  },
  {
    icon: ShieldCheck,
    title: "Check the books yourself",
    body: "The escrow's balance is public. It must always cover what the channel says its members hold, and the operator cannot pay anyone twice or pay more than is locked.",
  },
];

/** The explainer a first-time visitor reads before deciding to connect. */
export function HowItWorks() {
  return (
    <div className="mt-14 border-t border-border pt-12">
      <p className="num text-xs tracking-[0.25em] text-dim uppercase">How Cell works</p>

      <ol className="mt-7 space-y-6">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li
            key={title}
            className="flex gap-4 animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-700"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-secondary">
              <Icon className="size-[18px] text-primary" aria-hidden />
            </span>
            <div className="max-w-xl">
              <h3 className="text-sm font-semibold text-foreground">
                <span className="num mr-2 text-primary">{index + 1}</span>
                {title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-xl border border-border bg-card p-5">
        <p className="num text-[10px] tracking-[0.2em] text-warning uppercase">Before you start</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          <li>
            A Stellar wallet — <span className="text-foreground">Freighter</span>, switched to <span className="text-foreground">Testnet</span>.
          </li>
          <li>
            A few test XLM to pay fees with:{" "}
            <a
              href="https://lab.stellar.org/account/fund"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              open the faucet
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            . It is free and takes one ledger.
          </li>
          <li>An invitation link from an operator, or create your own channel once you are in.</li>
        </ul>
        <p className="mt-4 text-[13px] text-dim">
          This deployment runs on Stellar <span className="text-foreground">testnet</span>. Nothing here is real money.
        </p>
      </div>
    </div>
  );
}
