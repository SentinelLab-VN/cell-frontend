import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { ErrorState } from "@/components/ui/states";
import { useOpenAsset } from "@/features/chain/use-open-asset";
import type { Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { ChainButton } from "./chain-button";

export function StepAsset({ tenant }: { tenant: Tenant }) {
  const { assetText, setAssetText, capText, setCapText, asset, valid, open } = useOpenAsset(tenant.id, "XLM");

  return (
    <>
      <Card>
        <CardTitle>Open an asset</CardTitle>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            open.mutate();
          }}
        >
          <Field label="Asset" hint="XLM, or CODE:ISSUER for an issued asset such as USDC.">
            <Input
              name="asset"
              value={assetText}
              onChange={(event) => setAssetText(event.target.value)}
              disabled={open.isPending || open.isSuccess}
            />
          </Field>
          <Field label="Token contract (SAC)">
            <ReadOnlyBox trailing={asset ? "Resolved" : undefined}>
              {asset ? shortAddress(asset.tokenContractId) : "—"}
            </ReadOnlyBox>
          </Field>
          <Field
            label="Release cap — max per single payout"
            hint="Leave it empty for uncapped. A cap limits what one compromised operator signature can move; it does not limit how much a user can withdraw in total."
          >
            <Input
              name="release-cap"
              inputMode="decimal"
              placeholder="0"
              trailing={asset?.code}
              value={capText}
              onChange={(event) => setCapText(event.target.value)}
              disabled={open.isPending || open.isSuccess}
            />
          </Field>

          {open.isError && <ErrorState error={open.error} />}

          <ChainButton
            label={`Sign & open ${asset?.code ?? "asset"}`}
            submitting={open.isPending}
            confirming={open.isSuccess}
            disabled={!valid}
          />
        </form>
      </Card>

      <Note tone="info" label="One asset = one channel">
        Opening an asset creates the channel your users hold that balance in. You can open more later without
        redeploying — the same escrow backs all of them, and each keeps its own custody and its own cap.
      </Note>
    </>
  );
}
