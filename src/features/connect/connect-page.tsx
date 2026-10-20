import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { NetworkPill } from "@/components/layout/wallet-chip";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { LAB_FUND } from "@/features/onboarding/faucet";
import { signIn } from "@/features/session/sign-in";
import { useSession } from "@/features/session/use-session";
import { devWallet, type WalletProvider } from "@/lib/wallet";
import { ConnectHero } from "./connect-hero";
import { ConnectWalletCard } from "./connect-wallet-card";
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <TopBar right={<NetworkPill />} />

      <div className="relative mx-auto grid w-full max-w-[1360px] flex-1 items-center gap-8 pt-8 pb-12 max-lg:content-start md:gap-10 md:pt-10 lg:grid-cols-[1fr_auto] lg:gap-12 lg:px-10 lg:py-12 xl:gap-20">
        {/* Decorative mark anchored to the content column, not the window corner, so it stays near the copy on wide screens. */}
        <img
          src="/logo.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-40 w-[560px] max-w-none opacity-5"
        />

        {resolved ? (
          <>
            <div className="relative px-5 lg:px-0">
              <RoleGuide role={resolved} invited={invited} />
            </div>
            <div className="relative flex flex-col items-center px-5 lg:items-end lg:px-0">
              <ConnectWalletCard
                pending={connect.isPending}
                hasError={connect.isError}
                error={connect.error}
                onConnect={(provider) => connect.mutate(provider)}
                onConnectDev={(devSecret) => connect.mutate({ devSecret })}
              >
                {invitedTenant && (
                  <div className="mb-6">
                    <p className="mb-2 text-[15px] text-muted-foreground">Channel</p>
                    <ReadOnlyBox>{invitedTenant}</ReadOnlyBox>
                  </div>
                )}
                {needsTenant && (
                  <div className="mb-6">
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
              </ConnectWalletCard>

              <div className="mt-5 w-full max-w-[460px] max-lg:max-w-none">
                <FaucetNote />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative px-5 lg:px-0">
              <ConnectHero />
            </div>
            <div className="relative w-full px-5 lg:w-[460px] lg:px-0">
              <RoleChooser />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FaucetNote() {
  return (
    <p className="text-[15px] text-muted-foreground">
      Signing in costs nothing. Transactions need a few test XLM from{" "}
      <a
        href={LAB_FUND}
        target="_blank"
        rel="noreferrer"
        className="text-primary-ink underline-offset-4 hover:underline"
      >
        the faucet
      </a>
      .
    </p>
  );
}
