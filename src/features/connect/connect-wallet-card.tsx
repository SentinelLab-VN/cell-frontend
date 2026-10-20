import { ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/cn";
import { DEV_WALLET_ENABLED, walletProviders, type WalletProvider } from "@/lib/wallet";

/**
 * Official wallet marks (as published by Stellar Wallets Kit), keyed by provider id.
 * `plate` sits a transparent mark on white so it stays legible on the dark card.
 */
const WALLET_ICONS: Record<string, { src: string; plate?: boolean }> = {
  freighter: { src: "/wallets/freighter.png" },
  xbull: { src: "/wallets/xbull.png" },
  albedo: { src: "/wallets/albedo.png", plate: true },
  lobstr: { src: "/wallets/lobstr.png" },
};

/** The wallet's own mark; a wallet without one falls back to its initials. */
function ProviderTile({ provider }: { provider: WalletProvider }) {
  const icon = WALLET_ICONS[provider.id];
  if (icon) {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px]",
          icon.plate && "bg-white p-1",
        )}
      >
        <img src={icon.src} alt="" width={32} height={32} className="size-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="num flex size-8 shrink-0 items-center justify-center rounded-[9px] border border-border-strong bg-background text-[13px] font-semibold text-muted-foreground"
    >
      {provider.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

interface ConnectWalletCardProps {
  pending: boolean;
  error: unknown;
  hasError: boolean;
  onConnect: (provider: WalletProvider) => void;
  onConnectDev: (secret: string) => void;
  /** Channel fields the flow needs before connecting (an invited tenant, or a link to paste). */
  children?: ReactNode;
}

export function ConnectWalletCard({ pending, error, hasError, onConnect, onConnectDev, children }: ConnectWalletCardProps) {
  const [devSecret, setDevSecret] = useState("");
  // Keep the last error on screen while its row collapses, so the text doesn't vanish mid-animation.
  const [shownError, setShownError] = useState<unknown>(undefined);
  if (hasError && error !== shownError) setShownError(error);

  return (
    <div className="w-full max-w-[460px] rounded-2xl border border-border bg-card p-5 shadow-lg max-lg:max-w-none md:p-7">
      {children}
      <h2 className="text-xl font-semibold text-foreground">Connect your wallet</h2>

      <ul className="mt-5 space-y-2.5">
        {walletProviders.map((provider) => (
          <li key={provider.id}>
            <button
              type="button"
              disabled={provider.comingSoon || pending}
              onClick={() => onConnect(provider)}
              className={
                provider.comingSoon
                  ? "flex h-[52px] w-full cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-transparent px-3.5 text-left opacity-50"
                  : "flex h-[52px] w-full items-center gap-3 rounded-xl border border-border-strong bg-secondary px-3.5 text-left transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              <ProviderTile provider={provider} />
              <span className="flex-1 text-sm font-semibold text-foreground">{provider.name}</span>
              <span className="text-[13px] text-muted-foreground">{provider.comingSoon ? "Soon" : provider.hint}</span>
              {!provider.comingSoon && <ChevronRight className="size-4 text-dim" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>

      {DEV_WALLET_ENABLED && (
        <form
          className="mt-4 space-y-2.5 rounded-xl border border-dashed border-border-strong p-3.5"
          onSubmit={(event) => {
            event.preventDefault();
            onConnectDev(devSecret);
          }}
        >
          <p className="num flex items-center gap-1.5 text-[12px] tracking-[0.2em] text-warning uppercase">
            <span className="size-1.5 rounded-full bg-warning" aria-hidden />
            Development wallet
          </p>
          <Input
            type="password"
            name="dev-secret"
            aria-label="Secret seed"
            placeholder="S… secret seed — testnet keys only"
            className="text-ellipsis max-sm:text-[12px]"
            value={devSecret}
            onChange={(event) => setDevSecret(event.target.value)}
          />
          <Button type="submit" variant="secondary" block loading={pending} disabled={!devSecret}>
            Connect with seed
          </Button>
        </form>
      )}

      {/* The alert opens and closes by animating its row height, so the card eases to its new size instead of jumping. */}
      <div
        aria-hidden={!hasError}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          hasError ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {shownError !== undefined && (
            <div className="pt-4">
              <ErrorState error={shownError} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
