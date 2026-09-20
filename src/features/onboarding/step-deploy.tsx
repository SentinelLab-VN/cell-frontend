import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { ErrorState } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { walletStore } from "@/features/session/wallet-store";
import { keys } from "@/features/tenant/queries";
import { tenantsApi } from "@/lib/api/tenants";
import { shortAddress } from "@/lib/format";

const RETRY_MS = 4000;
const RETRIES = 12;

export function StepDeploy() {
  const session = useRequiredSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const deploy = useMutation({
    mutationFn: async () => {
      const [prepared, config, wallet] = await Promise.all([
        tenantsApi.prepareDeploy(),
        tenantsApi.config(),
        walletStore.require(),
      ]);
      const signedXdr = await wallet.signTransaction(prepared.xdr, config.networkPassphrase);

      // The service submits the deployment and answers with the tenant. `202`
      // means it has not settled yet, and the same request again is what finishes it.
      for (let attempt = 0; attempt < RETRIES; attempt++) {
        const result = await tenantsApi.create(name.trim(), signedXdr);
        if (result.kind === "created") return result.tenant;
        await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
      }
      throw new Error("The deployment is taking unusually long. It is safe to try again: nothing is deployed twice.");
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: keys.me });
      queryClient.setQueryData(keys.tenant(tenant.id), tenant);
      navigate(`/tenants/${tenant.id}/setup`, { replace: true });
    },
  });

  return (
    <>
      <Card>
        <CardTitle>Deploy the escrow</CardTitle>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            deploy.mutate();
          }}
        >
          <Field label="Tenant name">
            <Input
              name="tenant-name"
              placeholder="Acme Pay"
              maxLength={64}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={deploy.isPending}
            />
          </Field>
          <Field label="Network">
            <ReadOnlyBox>Testnet</ReadOnlyBox>
          </Field>
          <Field label="Admin (you)">
            <ReadOnlyBox trailing="Connected">{shortAddress(session.address)}</ReadOnlyBox>
          </Field>

          {deploy.isError && <ErrorState error={deploy.error} />}

          <Button type="submit" size="lg" block loading={deploy.isPending} disabled={!name.trim()}>
            {deploy.isPending ? "Deploying on chain…" : "Sign & deploy escrow"}
          </Button>
        </form>
      </Card>

      <Note tone="warn" label="The key you sign with becomes admin">
        Admin can replace the contract code and move funds held above what is owed. Use a key you can custody properly
        — a multisig or hardware wallet — not the browser extension you test with. It can be handed over later, but
        only by the current admin.
      </Note>
    </>
  );
}
