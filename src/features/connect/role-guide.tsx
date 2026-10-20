import { ArrowRight, Layers, Link2 } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";

export type Role = "operator" | "member";

type Guide = {
  title: string;
  lede: string;
  steps: { title: string; body: string }[];
  other: { role: Role; label: string };
};

const GUIDES: Record<Role, Guide> = {
  operator: {
    title: "Run a channel",
    lede: "Deploy an escrow you own, then hand your users a link.",
    steps: [
      { title: "Create a tenant", body: "One signature deploys your escrow." },
      { title: "Open an asset", body: "Add the operator key and fund it with XLM." },
      { title: "Share the link", body: "Anyone who opens it can deposit." },
    ],
    other: { role: "member", label: "I was sent a link" },
  },
  member: {
    title: "Use a channel",
    lede: "Someone runs a channel and wants to pay you, or be paid.",
    steps: [
      { title: "Enter the channel", body: "Paste the link or tenant ID and connect. Some channels wait for the operator's approval." },
      { title: "Deposit", body: "One transaction into the escrow, credited to you in the channel." },
      { title: "Pay instantly", body: "Off chain, free, invisible on Stellar." },
      { title: "Withdraw", body: "You sign, the operator approves, the escrow pays your wallet." },
    ],
    other: { role: "operator", label: "I run a channel" },
  },
};

/** The landing page's only question. */
export function RoleChooser() {
  return (
    <div className="grid gap-4">
      <RoleCard to="/start/operator" icon={Layers} title="I run a channel" body="Set up an escrow and share it." />
      <RoleCard to="/start/member" icon={Link2} title="I was sent a link" body="Deposit, pay, withdraw." />
    </div>
  );
}

function RoleCard({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-border-strong hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary-subtle-border bg-primary-subtle">
        <Icon className="size-5 text-primary-ink" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[15px] text-muted-foreground">{body}</span>
      </span>
      <ArrowRight
        className="size-5 text-dim transition-transform group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none"
        aria-hidden
      />
    </Link>
  );
}

/** One role's steps, above the connect card. */
export function RoleGuide({ role, invited = false }: { role: Role; invited?: boolean }) {
  const guide = GUIDES[role];
  return (
    <div>
      {!invited && (
        <Link to="/" className="text-[15px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Not you? {guide.other.label}
        </Link>
      )}
      <h1 className="mt-5 text-[36px] leading-[1.08] font-semibold tracking-[-0.03em] text-foreground md:text-[50px]">
        {guide.title}
      </h1>
      <p className="mt-4 max-w-[540px] text-base leading-[1.65] text-muted-foreground">
        {invited ? "You were sent a link to a channel. Connect a wallet to open it." : guide.lede}
      </p>

      <ol className="mt-8 max-w-[540px] space-y-4">
        {guide.steps.map(({ title, body }, index) => (
          <li key={title} className="flex gap-3.5 text-base leading-[1.6]">
            <span className="num mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-[13px] font-semibold text-primary-ink">
              {index + 1}
            </span>
            <span>
              <span className="font-medium text-foreground">{title}</span>
              <span className="text-muted-foreground"> — {body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
