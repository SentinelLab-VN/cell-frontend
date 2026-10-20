import { useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/top-bar";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { useTenant } from "@/features/tenant/queries";
import type { Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { StepAsset } from "./step-asset";
import { StepDeploy } from "./step-deploy";
import { StepFund } from "./step-fund";
import { StepLive } from "./step-live";
import { StepOperator } from "./step-operator";
import { Stepper } from "./stepper";
import { currentStep, type StepId } from "./steps";

/** `/tenants/new` before there is a tenant, `/tenants/:tenantId/setup` after. */
export function SetupPage() {
  const { tenantId } = useParams();
  return tenantId ? <ExistingTenantSetup tenantId={tenantId} /> : <SetupLayout step="deploy" panel={<StepDeploy />} intro />;
}

function ExistingTenantSetup({ tenantId }: { tenantId: string }) {
  // Polled: every step here finishes when the indexer sees it on chain.
  const tenant = useTenant(tenantId, true);

  if (tenant.isPending) return <SetupLayout step="deploy" panel={<Skeleton className="h-72" />} />;
  if (tenant.isError) return <SetupLayout step="deploy" panel={<ErrorState error={tenant.error} title="Could not load this tenant" />} />;

  const step = currentStep(tenant.data);
  return <SetupLayout step={step} tenant={tenant.data} panel={<StepPanel step={step} tenant={tenant.data} />} />;
}

function StepPanel({ step, tenant }: { step: StepId | "live"; tenant: Tenant }) {
  switch (step) {
    case "asset":
      return <StepAsset tenant={tenant} />;
    case "operator":
      return <StepOperator tenant={tenant} />;
    case "fund":
      return <StepFund tenant={tenant} />;
    default:
      return <StepLive tenant={tenant} />;
  }
}

interface SetupLayoutProps {
  step: StepId | "live";
  panel: React.ReactNode;
  tenant?: Tenant;
  intro?: boolean;
}

function SetupLayout({ step, panel, tenant, intro = false }: SetupLayoutProps) {
  const session = useRequiredSession();
  const who = tenant ? `${tenant.name}  ·  ${shortAddress(session.address)} (admin)` : shortAddress(session.address);

  return (
    <div className="min-h-screen">
      <TopBar right={<span className="num text-xs text-dim">{who}</span>} />
      <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-6 py-10 max-md:px-5 max-md:py-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {intro && (
            <div className="mb-6">
              <h1 className="text-[34px] font-semibold tracking-[-0.025em] text-foreground max-md:text-[30px]">Create your tenant</h1>
              <p className="mt-3 max-w-2xl text-[17px] leading-[1.6] text-muted-foreground">
                A tenant is one escrow contract you own. Each asset you open inside it becomes a channel your users can
                hold a balance in.
              </p>
            </div>
          )}
          <Stepper current={step} />
        </div>
        <div className="space-y-4">{panel}</div>
      </div>
    </div>
  );
}
