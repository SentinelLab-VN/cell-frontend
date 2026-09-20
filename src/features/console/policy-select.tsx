import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { keys } from "@/features/tenant/queries";
import { errorMessage } from "@/lib/error-message";
import { tenantsApi } from "@/lib/api/tenants";
import type { MembershipPolicy, Tenant } from "@/lib/api/types";

const POLICIES: { value: MembershipPolicy; label: string }[] = [
  { value: "open", label: "Anyone may join" },
  { value: "approval", label: "Joining needs approval" },
  { value: "invite_only", label: "Invited addresses only" },
];

/** Only the admin may change it; an operator sees it read-only. */
export function PolicySelect({ tenant }: { tenant: Tenant }) {
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (policy: MembershipPolicy) => tenantsApi.setPolicy(tenant.id, policy),
    onSuccess: (updated) => queryClient.setQueryData(keys.tenant(tenant.id), updated),
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <select
      aria-label="Membership policy"
      className="h-8 rounded-lg border border-border-strong bg-card px-2.5 text-[13px] text-foreground disabled:opacity-60"
      value={save.variables ?? tenant.membershipPolicy}
      disabled={tenant.role !== "admin" || save.isPending}
      onChange={(event) => save.mutate(event.target.value as MembershipPolicy)}
    >
      {POLICIES.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
