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
    <div className="mt-10 grid gap-3">
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
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
        <Icon className="size-[18px] text-primary" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-foreground">{title}</span>
        <span className="block text-[13px] text-muted-foreground">{body}</span>
      </span>
      <ArrowRight className="size-4 text-dim transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

/** One role's steps, above the connect card. */
export function RoleGuide({ role, invited = false }: { role: Role; invited?: boolean }) {
  const guide = GUIDES[role];
  return (
    <div>
      {!invited && (
        <Link to="/" className="text-[13px] text-dim underline-offset-4 hover:text-foreground hover:underline">
          ← Not you? {guide.other.label}
        </Link>
      )}
      <h1 className="mt-4 text-[30px] font-semibold tracking-tight text-foreground">{guide.title}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {invited ? "You were sent a link to a channel. Connect a wallet to open it." : guide.lede}
      </p>

      <ol className="mt-7 space-y-3">
        {guide.steps.map(({ title, body }, index) => (
          <li key={title} className="flex gap-3.5 text-[14px]">
            <span className="num w-4 shrink-0 text-primary">{index + 1}</span>
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
