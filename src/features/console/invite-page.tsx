import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ReadOnlyBox } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { Pill } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { TableWrap, Td, Th, THead, Tr } from "@/components/ui/table";
import { AddressText, CopyButton } from "@/components/ui/text";
import { keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { referralApi } from "@/lib/api/auth";
import { errorMessage } from "@/lib/error-message";
import { timeAgo } from "@/lib/format";
import { referralLink } from "@/lib/referral";
import { OverviewStatCard } from "./overview-stat-card";
import { useMyReferral, useMyReferralMembers } from "./queries";

/**
 * The operator's invite link. The code belongs to the wallet, so it is the
 * same on every tenant this wallet runs; the link differs only in where it
 * lands.
 */
export function InvitePage() {
  const tenant = useCurrentTenant();
  const queryClient = useQueryClient();
  const referral = useMyReferral();
  const members = useMyReferralMembers(!!referral.data);

  const mint = useMutation({
    mutationFn: referralApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData(keys.referral, created);
      toast.success("Your invite link is ready");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (referral.isError) return <Page title="Invite"><ErrorState error={referral.error} /></Page>;
  if (referral.isPending) return <Page title="Invite"><Skeleton className="h-40 rounded-2xl" /></Page>;

  const code = referral.data?.code;
  const link = code ? referralLink(tenant.id, code) : null;

  return (
    <Page title="Invite" subtitle="A link that brings people here, and who came through it">
      {!link && (
        <EmptyState icon={<Share2 className="size-5" aria-hidden />} title="No invite link yet">
          Create one and share it. Whoever opens it signs in as a member of {tenant.name}, and you see them land
          here.
          <span className="mt-5 block">
            <Button loading={mint.isPending} onClick={() => mint.mutate()}>
              Create my invite link
            </Button>
          </span>
        </EmptyState>
      )}

      {link && (
        <div className="space-y-6">
          <Card>
            <CardTitle>Your link</CardTitle>
            <div className="mt-4">
              <ReadOnlyBox trailing={<CopyButton value={link} label="Copy link" />}>{link}</ReadOnlyBox>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Code <span className="num text-foreground">{code}</span>. The first link a wallet arrives with is the one
              it counts for, and your own wallet never counts.
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <OverviewStatCard label="Signed in" value={referral.data!.signups} hint="wallets that came through your link" />
            <OverviewStatCard label="Deposited" value={referral.data!.depositors} hint="of those, made a first deposit" />
          </div>

          {members.isError && <ErrorState error={members.error} />}
          {members.isPending && <Skeleton className="h-40 rounded-2xl" />}
          {members.data?.length === 0 && (
            <EmptyState icon={<Users className="size-5" aria-hidden />} title="Nobody yet">
              Share the link above. People appear here the moment they sign in.
            </EmptyState>
          )}
          {!!members.data?.length && (
            <TableWrap>
              <THead>
                <tr>
                  <Th>Wallet</Th>
                  <Th>Signed in</Th>
                  <Th className="text-right">Deposit</Th>
                </tr>
              </THead>
              <tbody>
                {members.data.map((member) => (
                  <Tr key={member.address}>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <AddressText address={member.address} className="text-[15px]" />
                        <CopyButton value={member.address} />
                      </span>
                    </Td>
                    <Td className="text-[15px] text-muted-foreground">{timeAgo(member.attributedAt)}</Td>
                    <Td className="text-right">
                      {member.firstDepositAt ? (
                        <Pill tone="ok">Deposited {timeAgo(member.firstDepositAt)}</Pill>
                      ) : (
                        <Pill tone="neutral">Not yet</Pill>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}

          <Note tone="info" label="Testnet">
            Invitees need a funded testnet wallet to deposit. Point them at the faucet on the connect screen.
          </Note>
        </div>
      )}
    </Page>
  );
}
