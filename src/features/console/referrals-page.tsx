import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ReadOnlyBox } from "@/components/ui/field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { TableWrap, Td, Th, THead, Tr } from "@/components/ui/table";
import { AddressText, AmountText, CopyButton } from "@/components/ui/text";
import { keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { referralApi } from "@/lib/api/auth";
import type { AssetAmount, AssetVolume } from "@/lib/api/types";
import { errorMessage } from "@/lib/error-message";
import { referralLink } from "@/lib/referral";
import { useLeaderboard, useMyReferral } from "./queries";

/**
 * Three things on one screen: the operator's own invite link, who refers the
 * most, and who moves the most. Assets stay in their own columns; XLM and
 * USDC are never added together.
 */
export function ReferralsPage() {
  const tenant = useCurrentTenant();
  const queryClient = useQueryClient();
  const referral = useMyReferral();
  const board = useLeaderboard(tenant.id);

  const mint = useMutation({
    mutationFn: referralApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData(keys.referral, created);
      queryClient.invalidateQueries({ queryKey: keys.leaderboard(tenant.id) });
      toast.success("Your invite link is ready");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const code = referral.data?.code;
  const assets = board.data?.assets ?? ["XLM", "USDC"];

  return (
    <Page title="Referrals" subtitle="Your invite link, and who is bringing people and money in">
      <div className="space-y-6">
        <Card>
          <CardTitle>Your invite link</CardTitle>
          {referral.isError && <ErrorState error={referral.error} />}
          {referral.isPending && <Skeleton className="mt-4 h-11 rounded-[10px]" />}
          {referral.data === null && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-[15px] text-muted-foreground">
                Whoever opens it signs in as a member of {tenant.name}, and counts for you.
              </p>
              <Button loading={mint.isPending} onClick={() => mint.mutate()}>Create my link</Button>
            </div>
          )}
          {code && (
            <div className="mt-4 space-y-2">
              <ReadOnlyBox trailing={<CopyButton value={referralLink(tenant.id, code)} label="Copy link" />}>
                {referralLink(tenant.id, code)}
              </ReadOnlyBox>
              <p className="num text-xs text-dim">
                {code} · {referral.data!.signups} signed in · {referral.data!.depositors} deposited
              </p>
            </div>
          )}
        </Card>

        {board.isError && <ErrorState error={board.error} />}
        {board.isPending && <Skeleton className="h-64 rounded-2xl" />}
        {board.data && (
          <>
            <section className="space-y-3">
              <h2 className="text-[15px] font-medium text-foreground">Top referrers</h2>
              {board.data.referrers.length === 0 ? (
                <EmptyState title="No invite links yet" />
              ) : (
                <TableWrap>
                  <THead>
                    <tr>
                      <Th>Wallet</Th>
                      <Th>Code</Th>
                      <Th className="text-right">Signed in</Th>
                      <Th className="text-right">Deposited</Th>
                      {assets.map((asset) => (
                        <Th key={asset} className="text-right">{asset} brought in</Th>
                      ))}
                    </tr>
                  </THead>
                  <tbody>
                    {board.data.referrers.map((row) => (
                      <Tr key={row.code}>
                        <Td><AddressText address={row.address} className="text-[15px]" /></Td>
                        <Td className="num text-[15px]">{row.code}</Td>
                        <Td className="num text-right text-[15px]">{row.signups}</Td>
                        <Td className="num text-right text-[15px]">{row.depositors}</Td>
                        {assets.map((asset) => (
                          <Td key={asset} className="text-right text-[15px]">
                            <Referred rows={row.referred} asset={asset} />
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-[15px] font-medium text-foreground">Top by volume</h2>
              {board.data.members.length === 0 ? (
                <EmptyState title="No activity yet" />
              ) : (
                <TableWrap>
                  <THead>
                    <tr>
                      <Th>Wallet</Th>
                      {assets.map((asset) => (
                        <Th key={asset} className="text-right">{asset} deposited / sent</Th>
                      ))}
                    </tr>
                  </THead>
                  <tbody>
                    {board.data.members.map((row) => (
                      <Tr key={row.address}>
                        <Td><AddressText address={row.address} className="text-[15px]" /></Td>
                        {assets.map((asset) => (
                          <Td key={asset} className="text-right text-[15px]">
                            <Volume rows={row.volume} asset={asset} />
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </section>
          </>
        )}
      </div>
    </Page>
  );
}

function Referred({ rows, asset }: { rows: AssetAmount[]; asset: string }) {
  const row = rows.find((r) => r.assetCode === asset);
  if (!row) return <span className="text-dim">—</span>;
  return <AmountText units={row.amount} decimals={row.decimals} />;
}

function Volume({ rows, asset }: { rows: AssetVolume[]; asset: string }) {
  const row = rows.find((r) => r.assetCode === asset);
  if (!row) return <span className="text-dim">—</span>;
  return (
    <span className="num">
      <AmountText units={row.deposited} decimals={row.decimals} />
      <span className="text-dim"> / </span>
      <AmountText units={row.sent} decimals={row.decimals} />
    </span>
  );
}
