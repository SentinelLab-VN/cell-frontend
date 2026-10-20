import { useMutation } from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Pill, type Tone } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { TableWrap, Td, Th, THead, Tr } from "@/components/ui/table";
import { AddressText, CopyButton } from "@/components/ui/text";
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
            <UserPlus className="size-[15px]" aria-hidden /> Add an address
          </Button>
        </>
      }
    >
      {members.isPending && <Skeleton className="h-64 rounded-2xl" />}
      {members.isError && <ErrorState error={members.error} />}
      {members.data?.length === 0 && <EmptyState icon={<Users className="size-5" aria-hidden />} title="No members yet" />}

      {!!members.data?.length && (
        <TableWrap>
          <THead>
            <tr>
              <Th>Address</Th>
              <Th>Status</Th>
              <Th className="text-right">Last seen</Th>
              <Th />
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
                <Td>
                  <Pill tone={LABEL[member.label].tone}>{LABEL[member.label].text}</Pill>
                </Td>
                <Td className="text-right text-[15px] text-muted-foreground">{timeAgo(member.lastLoginAt)}</Td>
                <Td className="space-x-2 text-right">
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
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <InviteDialog tenantId={tenant.id} open={inviting} onOpenChange={setInviting} />
      {blocking && <BlockDialog tenantId={tenant.id} member={blocking} onClose={() => setBlocking(null)} />}
    </Page>
  );
}
