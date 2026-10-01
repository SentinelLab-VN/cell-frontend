import { useMutation } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { signIn } from "@/features/session/sign-in";
import { useSession } from "@/features/session/use-session";
import { DEV_WALLET_ENABLED, devWallet, walletProviders, type WalletProvider } from "@/lib/wallet";
import { RoleChooser, RoleGuide, type Role } from "./role-guide";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** A tenant id, or a link that carries one. */
function parseTenantRef(text: string): string | undefined {
  return text.match(UUID)?.[0]?.toLowerCase();
}

/**
 * `/` asks which of the two roles the visitor is; `/start/:role` explains
 * that role in a few lines and connects. A visitor who arrived through a
 * tenant link is a member by definition and skips the question.
 */
export function ConnectPage({ role }: { role?: Role }) {
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [devSecret, setDevSecret] = useState("");
  const [tenantRef, setTenantRef] = useState("");

  // RequireSession sends a visitor here with the path they tried to open.
  const from = (location.state as { from?: string } | null)?.from;
  const invited = from?.startsWith("/t/") ?? false;
  const resolved: Role | undefined = role ?? (invited ? "member" : undefined);
  const invitedTenant = invited ? parseTenantRef(from ?? "") : undefined;
  const typedTenant = parseTenantRef(tenantRef);
  // A member who typed a link or id lands in that tenant; nobody else needs one.
  const needsTenant = resolved === "member" && !invited;
  const destination = from ?? (typedTenant ? `/t/${typedTenant}` : "/home");

  const connect = useMutation({
    mutationFn: async (source: WalletProvider | { devSecret: string }) => {
      if ("devSecret" in source) return signIn(devWallet(source.devSecret), source.devSecret);
      return signIn(await source.connect());
    },
    onSuccess: () => {
      // Home sends an operator with no tenant straight to the wizard.
      navigate(destination, { replace: true, state: resolved === "operator" ? { intent: "operator" } : undefined });
    },
  });

  if (session && !connect.isPending) return <Navigate to={destination} replace />;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar right={<span className="num text-xs text-dim">Testnet</span>} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-14">
        {resolved ? (
          <>
            <RoleGuide role={resolved} invited={invited} />

            <Card className="mt-8 p-6">
              {invitedTenant && (
                <div className="mb-5">
                  <p className="mb-2 text-[13px] text-muted-foreground">Channel</p>
                  <ReadOnlyBox>{invitedTenant}</ReadOnlyBox>
                </div>
              )}
              {needsTenant && (
                <div className="mb-5">
                  <Field
                    label="Channel link or tenant ID"
                    hint={
                      tenantRef && !typedTenant
                        ? "That does not look like a Cell link or tenant ID."
                        : "Paste what the operator sent you. Leave it empty to sign in without a channel."
                    }
                  >
                    <Input
                      name="tenant"
                      placeholder="https://…/t/… or 8f3a…"
                      value={tenantRef}
                      onChange={(event) => setTenantRef(event.target.value)}
                    />
                  </Field>
                </div>
              )}
              <h2 className="text-[15px] font-semibold text-foreground">Connect your wallet</h2>
              <ul className="mt-4 space-y-2">
                {walletProviders.map((provider) => (
                  <li key={provider.id}>
                    <button
                      type="button"
                      disabled={provider.comingSoon || connect.isPending}
                      onClick={() => connect.mutate(provider)}
                      className="flex h-12 w-full items-center gap-3 rounded-[10px] border border-border bg-secondary/60 px-3.5 text-left transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="mt-3 space-y-2 rounded-[10px] border border-dashed border-border-strong p-3.5"
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
            </Card>

            <p className="mt-5 text-[13px] text-dim">
              Signing in costs nothing. Transactions need a few test XLM from{" "}
              <a
                href="https://lab.stellar.org/account/fund"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                the faucet
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <p className="num text-xs tracking-[0.25em] text-primary uppercase">Cell</p>
            <h1 className="mt-4 text-[38px] leading-[1.15] font-semibold tracking-tight text-foreground">
              Instant transfers, backed on Stellar.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Balances live in an escrow anyone can audit. Payments inside the channel are instant and private.
            </p>
            <RoleChooser />
          </>
        )}
      </main>
    </div>
  );
}
