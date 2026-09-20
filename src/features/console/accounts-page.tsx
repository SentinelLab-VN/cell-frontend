import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Pill, type Tone } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { AddressText } from "@/components/ui/text";
import { errorMessage } from "@/lib/error-message";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { operatorApi } from "@/lib/api/operator";
import type { MemberLabel, MemberRow } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { BlockDialog } from "./dialogs/block-dialog";
import { InviteDialog } from "./dialogs/invite-dialog";
import { PolicySelect } from "./policy-select";
import { useMembers, useRefreshTenant } from "./queries";

const LABEL: Record<MemberLabel, { text: string; tone: Tone }> = {
  blocked: { text: "Blocked", tone: "danger" },
  verified: { text: "Verified", tone: "ok" },
  signedIn: { text: "Signed in", tone: "info" },
  neverSignedIn: { text: "Never signed in", tone: "neutral" },
};

export function AccountsPage() {
  const tenant = useCurrentTenant();
  const members = useMembers(tenant.id);
  const refresh = useRefreshTenant(tenant.id);
  const [inviting, setInviting] = useState(false);
  const [blocking, setBlocking] = useState<MemberRow | null>(null);

  const change = useMutation({
    mutationFn: ({ address, action }: { address: string; action: "approve" | "unblock" }) =>
      action === "approve" ? operatorApi.approveMember(tenant.id, address) : operatorApi.unblock(tenant.id, address),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Page
      title="Accounts"
      subtitle="Who may hold money in this tenant"
      actions={
        <>
          <PolicySelect tenant={tenant} />
          <Button size="sm" onClick={() => setInviting(true)}>
            <UserPlus className="size-4" aria-hidden /> Add an address
          </Button>
        </>
      }
    >
      {members.isPending && <Skeleton className="h-48" />}
      {members.isError && <ErrorState error={members.error} />}
      {members.data?.length === 0 && <EmptyState title="No members yet" />}

      {!!members.data?.length && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/60">
              <tr className="num text-[10px] tracking-[0.2em] text-dim uppercase">
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Last seen</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.data.map((member) => (
                <tr key={member.address} className="border-t border-border text-sm">
                  <td className="px-5 py-3.5"><AddressText address={member.address} /></td>
                  <td className="px-5 py-3.5">
                    {member.status === "pending" ? (
                      <Pill tone="warn">Waiting for approval</Pill>
                    ) : (
                      <Pill tone={LABEL[member.label].tone}>{LABEL[member.label].text}</Pill>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-muted-foreground">{timeAgo(member.lastLoginAt)}</td>
                  <td className="space-x-2 px-5 py-3.5 text-right">
                    {member.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => change.mutate({ address: member.address, action: "approve" })}>
                        Approve
                      </Button>
                    )}
                    {member.status === "blocked" ? (
                      <Button size="sm" variant="outline" onClick={() => change.mutate({ address: member.address, action: "unblock" })}>
                        Unblock
                      </Button>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => setBlocking(member)}>Block</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InviteDialog tenantId={tenant.id} open={inviting} onOpenChange={setInviting} />
      {blocking && <BlockDialog tenantId={tenant.id} member={blocking} onClose={() => setBlocking(null)} />}
    </Page>
  );
}
