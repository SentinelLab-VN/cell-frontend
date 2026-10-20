import type { Tenant } from "@/lib/api/types";

export type StepId = "name" | "deploy" | "asset" | "operator" | "fund";

export const STEPS: { id: StepId; title: string; detail: string }[] = [
  { id: "name", title: "Name your tenant", detail: "Label and network" },
  { id: "deploy", title: "Deploy the escrow", detail: "You sign the deploy; your key becomes admin" },
  { id: "asset", title: "Open your first asset", detail: "allow_mint sets the release cap" },
  { id: "operator", title: "Add an operator key", detail: "This tenant's own key — it signs every payout" },
  { id: "fund", title: "Fund the operator account", detail: "XLM that pays for each payout" },
];

/**
 * Where setup stands, read from what the indexer has confirmed on chain — not
 * from what this browser remembers doing. So it resumes correctly after a
 * reload, on another device, or when a step was done outside the app.
 */
export function currentStep(tenant: Tenant | undefined): StepId | "live" {
  if (!tenant) return "deploy";
  if (tenant.status !== "provisioning") return "live";

  const done = tenant.activation;
  if (!done?.mintConfirmed) return "asset";
  if (!done.operatorConfirmed) return "operator";
  if (!done.operatorFunded) return "fund";
  // All four, not three: the indexer confirms the admin too.
  if (!done.adminConfirmed) return "fund";
  return "live";
}
