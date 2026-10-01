import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Note } from "@/components/ui/note";
import { Pill } from "@/components/ui/pill";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { AddressText, AmountText } from "@/components/ui/text";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { formatXlm, shortHash } from "@/lib/format";
import { explorerContract } from "@/lib/stellar/network";
import { RemoveOperatorDialog } from "./dialogs/remove-operator-dialog";
import { TopUpDialog } from "./dialogs/top-up-dialog";
import { ResumeWorkerDialog, RotateTreeDialog } from "./dialogs/worker-dialogs";
import { useContract, useOverview } from "./queries";

export function ContractPage() {
  const tenant = useCurrentTenant();
  const isAdmin = tenant.role === "admin";
  const contract = useContract(tenant.id);
  const overview = useOverview(tenant.id);
  const [toppingUp, setToppingUp] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [resuming, setResuming] = useState(false);

  if (contract.isError) return <Page title="Contract"><ErrorState error={contract.error} /></Page>;
  if (!contract.data) return <Page title="Contract"><Skeleton className="h-64" /></Page>;

  const { escrowContractId, admin, operators, assets, tree, wasmHash, storageVersion, ourSigner, releaseSigner } = contract.data;
  // The key we hold and the key the escrow authorised must be the same one;
  // when they are not, every release would revert NotAuthorized.
  const signerMismatch = !!ourSigner && releaseSigner !== ourSigner;
  const halted = overview.data?.releaseWorkerHalted ?? false;

  return (
    <Page
      title="Contract"
      subtitle="The escrow on Stellar, as the chain reports it"
      actions={
        <a className="text-[13px] text-info hover:underline" href={explorerContract(escrowContractId)} target="_blank" rel="noreferrer">
          View on explorer ↗
        </a>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardTitle>Escrow</CardTitle>
          <KeyValueList className="mt-5">
            <KeyValue label="Contract"><AddressText address={escrowContractId} /></KeyValue>
            <KeyValue label="Admin">{admin ? <AddressText address={admin} /> : "—"}</KeyValue>
            <KeyValue label="Code">{wasmHash ? shortHash(wasmHash) : "—"}</KeyValue>
            <KeyValue label="Storage version">{storageVersion ?? "—"}</KeyValue>
          </KeyValueList>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Keys</CardTitle>
            {isAdmin && <Button size="sm" variant="outline" onClick={() => setToppingUp(true)}>Top up fees</Button>}
          </div>
          <KeyValueList className="mt-5">
            <KeyValue label="Operator account">
              {tenant.operatorAddress ? <AddressText address={tenant.operatorAddress} /> : "—"}
            </KeyValue>
            <KeyValue label="Fee balance">{formatXlm(tenant.operatorBalance)}</KeyValue>
          </KeyValueList>
          <ul className="mt-5 space-y-2 border-t border-border pt-4">
            {operators.map((operator) => (
              <li key={operator.address} className="flex items-center justify-between gap-3 text-sm">
                <AddressText address={operator.address} />
                <span className="flex items-center gap-2">
                  {operator.address === tenant.operatorAddress && <Pill tone="accent">Ours</Pill>}
                  <Pill tone={operator.enabled ? "ok" : "neutral"}>{operator.enabled ? "May pay out" : "Removed"}</Pill>
                  {isAdmin && operator.enabled && (
                    <Button size="sm" variant="ghost" onClick={() => setRemoving(operator.address)}>Remove</Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Payout proofs</CardTitle>
            <span className="flex gap-2">
              {isAdmin && halted && (
                <Button size="sm" onClick={() => setResuming(true)}>Resume payouts</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setRotating(true)}>New tree…</Button>
            </span>
          </div>
          <KeyValueList className="mt-5">
            <KeyValue label="Tree">#{tree.treeIndex}</KeyValue>
            <KeyValue label="Next withdrawal number">{tree.nextNonce}</KeyValue>
            <KeyValue label="Left before a new tree">{tree.noncesRemaining.toLocaleString()}</KeyValue>
            <KeyValue label="Root on chain">{shortHash(tree.confirmedRoot)}</KeyValue>
            <KeyValue label="Payouts">
              {halted ? <Pill tone="danger">Halted</Pill> : <Pill tone="ok">Running</Pill>}
            </KeyValue>
          </KeyValueList>
        </Card>

        <Card>
          <CardTitle>Assets</CardTitle>
          <ul className="mt-5 space-y-3">
            {assets.map((asset) => (
              <li key={asset.channelId} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{asset.assetCode}</span>
                <AmountText units={asset.onchainBalance ?? asset.totalLocked} decimals={7} code={asset.assetCode} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {signerMismatch && (
        <div className="mt-4">
          <Note tone="danger" label="The escrow has not authorised the key Cell pays out with">
            Cell holds {shortHash(ourSigner!)}; the escrow's operator for payouts is {releaseSigner ? shortHash(releaseSigner) : "nobody"}.
            Add Cell's key with add_operator, or payouts stay stopped.
          </Note>
        </div>
      )}

      {!tenant.operatorFunded && (
        <div className="mt-4">
          <Note tone="danger" label="Payouts are paused: the operator account is out of fees">
            It can no longer pay the network fee of a payout. Nothing is lost — top it up and they resume.
          </Note>
        </div>
      )}

      {toppingUp && <TopUpDialog tenant={tenant} onClose={() => setToppingUp(false)} />}
      {removing && <RemoveOperatorDialog tenant={tenant} operator={removing} onClose={() => setRemoving(null)} />}
      {rotating && <RotateTreeDialog tenantId={tenant.id} onClose={() => setRotating(false)} />}
      {resuming && <ResumeWorkerDialog tenantId={tenant.id} onClose={() => setResuming(false)} />}
    </Page>
  );
}
