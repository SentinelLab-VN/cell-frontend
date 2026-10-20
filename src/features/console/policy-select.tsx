import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
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
    <span className="relative inline-flex items-center">
    <select
      aria-label="Membership policy"
      // Native select stays for keyboard and mobile pickers; the chevron is drawn over it.
      className="h-9 cursor-pointer appearance-none rounded-[10px] border border-border-strong bg-card pr-8 pl-3 text-[15px] text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      value={save.variables ?? tenant.membershipPolicy}
      disabled={tenant.role !== "admin" || save.isPending}
      onChange={(event) => save.mutate(event.target.value as MembershipPolicy)}
    >
      {POLICIES.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-dim" aria-hidden />
    </span>
  );
}
