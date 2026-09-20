import { Card, CardTitle } from "@/components/ui/card";
import { Field, ReadOnlyBox } from "@/components/ui/field";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Note } from "@/components/ui/note";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { CopyButton } from "@/components/ui/text";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { channelsApi } from "@/lib/api/channels";
import type { Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { ChainButton } from "./chain-button";

export function StepOperator({ tenant }: { tenant: Tenant }) {
  const operator = tenant.operatorAddress;
  const add = useSubmitTx(() => channelsApi.prepareAddOperator(tenant.id, operator!));

  // Assigned by the indexer a moment after the tenant is created.
  if (!operator) return <Skeleton className="h-72" />;

  return (
    <>
      <Card>
        <CardTitle>Add an operator key</CardTitle>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            add.mutate();
          }}
        >
          <Field label="Operator key — generated for this tenant">
            <ReadOnlyBox trailing={<CopyButton value={operator} label="Copy operator key" />}>
              {shortAddress(operator, 6)}
            </ReadOnlyBox>
          </Field>

          <KeyValueList>
            <KeyValue label="Can do">release_funds, reset_smt_root</KeyValue>
            <KeyValue label="Cannot do" mono={false}>
              open assets, move the admin, upgrade
            </KeyValue>
            <KeyValue label="Worst case per signature" mono={false}>
              the asset's release cap
            </KeyValue>
          </KeyValueList>

          {add.isError && <ErrorState error={add.error} />}
          <ChainButton label="Sign & add operator" submitting={add.isPending} confirming={add.isSuccess} />
        </form>
      </Card>

      <Note tone="danger" label="One key per tenant — and never your admin key">
        Cell holds a separate operator key for every tenant, so your payouts never queue behind anyone else's and
        revoking it touches nobody but you. It is hot — it signs every payout — which is why it can only release, up
        to the cap. Keep your admin key cold and separate: if the operator key leaks you remove it and add another. If
        the admin key leaks, the tenant is gone.
      </Note>
    </>
  );
}
