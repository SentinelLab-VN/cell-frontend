import { useMutation } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { signIn } from "@/features/session/sign-in";
import { useSession } from "@/features/session/use-session";
import { DEV_WALLET_ENABLED, devWallet, walletProviders, type WalletProvider } from "@/lib/wallet";
import { HowItWorks } from "./how-it-works";

const NEXT_STEPS = [
  "Server returns a one-time challenge nonce",
  "Your wallet signs it — no transaction, no fee",
  "You get a session token for this wallet",
];

export function ConnectPage() {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [devSecret, setDevSecret] = useState("");

  const connect = useMutation({
    mutationFn: async (source: WalletProvider | { devSecret: string }) => {
      if ("devSecret" in source) return signIn(devWallet(source.devSecret), source.devSecret);
      return signIn(await source.connect());
    },
    onSuccess: () => navigate((location.state as { from?: string } | null)?.from ?? "/home", { replace: true }),
  });

  if (session && !connect.isPending) return <Navigate to="/home" replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar right={<span className="num text-xs text-dim">Testnet</span>} />

      <div className="grid flex-1 lg:grid-cols-[57%_43%]">
        <section className="flex flex-col justify-center border-border px-8 py-16 lg:border-r lg:px-20">
          <p className="num text-xs tracking-[0.25em] text-primary uppercase">Cell</p>
          <h1 className="mt-5 max-w-lg text-[44px] leading-[1.15] font-semibold tracking-tight text-foreground">
            Instant transfers, backed on Stellar.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Your balance is held in an on-chain escrow you can verify. Transfers inside the channel settle instantly
            and never appear on mainnet.
          </p>

          <HowItWorks />
        </section>

        <section className="px-8 py-16">
          <Card className="sticky top-16 mx-auto w-full max-w-[460px] p-7">
            <h2 className="text-xl font-semibold text-foreground">Connect your wallet</h2>
            <p className="mt-3 text-[13px] text-muted-foreground">
              No email, no password. Your Stellar key is your account.
            </p>

            <ul className="mt-5 space-y-2.5">
              {walletProviders.map((provider) => (
                <li key={provider.id}>
                  <button
                    type="button"
                    disabled={provider.comingSoon || connect.isPending}
                    onClick={() => connect.mutate(provider)}
                    className="flex h-[52px] w-full items-center gap-3 rounded-[10px] border border-border bg-secondary/60 px-3.5 text-left transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="size-6 rounded-md bg-border-strong" aria-hidden />
                    <span className="flex-1 text-sm font-medium text-foreground">{provider.name}</span>
                    <span className="text-[11px] text-dim">{provider.comingSoon ? "Soon" : provider.hint}</span>
                    <ChevronRight className="size-4 text-dim" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            {DEV_WALLET_ENABLED && (
              <form
                className="mt-4 space-y-2.5 rounded-[10px] border border-dashed border-border-strong p-3.5"
                onSubmit={(event) => {
                  event.preventDefault();
                  connect.mutate({ devSecret });
                }}
              >
                <p className="num text-[10px] tracking-[0.2em] text-warning uppercase">Development wallet</p>
                <Input
                  type="password"
                  name="dev-secret"
                  aria-label="Secret seed"
                  placeholder="S… secret seed — testnet keys only"
                  value={devSecret}
                  onChange={(event) => setDevSecret(event.target.value)}
                />
                <Button type="submit" variant="secondary" block loading={connect.isPending} disabled={!devSecret}>
                  Connect with seed
                </Button>
              </form>
            )}

            {connect.isError && (
              <div className="mt-4">
                <ErrorState error={connect.error} />
              </div>
            )}

            <div className="mt-6 border-t border-border pt-5">
              <p className="num text-[10px] tracking-[0.2em] text-dim uppercase">What happens next</p>
              <ol className="mt-3 space-y-2.5">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="flex gap-3 text-[13px] text-muted-foreground">
                    <span className="num text-primary">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
