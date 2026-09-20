import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Note } from "@/components/ui/note";
import { ErrorState } from "@/components/ui/states";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { parseAmount } from "@/lib/amount";
import { channelsApi } from "@/lib/api/channels";
import type { Tenant } from "@/lib/api/types";
import { formatXlm, shortAddress } from "@/lib/format";
import { ChainButton } from "./chain-button";

const XLM_DECIMALS = 7;

export function StepFund({ tenant }: { tenant: Tenant }) {
  const [amountText, setAmountText] = useState("10");
  const amount = parseAmount(amountText, XLM_DECIMALS);
  const fund = useSubmitTx(() => channelsApi.prepareFundOperator(tenant.id, amount!));

  return (
    <>
      <Card>
        <CardTitle>Fund the operator account</CardTitle>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            fund.mutate();
          }}
        >
          <Field label="Operator account — this tenant's own">
            <ReadOnlyBox trailing={<span className="text-warning">{formatXlm(tenant.operatorBalance)}</span>}>
              {tenant.operatorAddress ? shortAddress(tenant.operatorAddress, 6) : "—"}
            </ReadOnlyBox>
          </Field>
          <Field label="Amount">
            <Input
              name="fund-amount"
              inputMode="decimal"
              trailing="XLM"
              value={amountText}
              onChange={(event) => setAmountText(event.target.value)}
              disabled={fund.isPending || fund.isSuccess}
            />
          </Field>

          <KeyValueList>
            <KeyValue label="Pays for" mono={false}>
              the network fee of every payout
            </KeyValue>
            <KeyValue label="Needed to go live">2 XLM</KeyValue>
            <KeyValue label="Suggested" mono={false}>
              10 XLM · several hundred payouts
            </KeyValue>
          </KeyValueList>

          {fund.isError && <ErrorState error={fund.error} />}
          <ChainButton
            label={`Sign & send ${amountText || "0"} XLM`}
            submitting={fund.isPending}
            confirming={fund.isSuccess}
            disabled={!amount || amount === "0"}
          />
        </form>
      </Card>

      <Note tone="danger" label="Fees only — never your users' money">
        Every payout is a transaction, and this account pays for it. It never holds customer funds — those stay in the
        escrow. If it runs dry, payouts pause and nothing is lost: the overview shows the balance and asks you to top
        up.
      </Note>
    </>
  );
}
