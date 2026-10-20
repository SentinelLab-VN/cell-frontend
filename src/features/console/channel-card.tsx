import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Pill } from "@/components/ui/pill";
import { AddressText, AmountText, CopyButton } from "@/components/ui/text";
import type { Channel } from "@/lib/api/types";

interface Props {
  channel: Channel;
  /** Set for admins on channels that are past provisioning. */
  onPause?: () => void;
  /** Set alongside onPause: opens the dialog that changes the largest single payout. */
  onChangeCap?: () => void;
}

export function ChannelCard({ channel, onPause, onChangeCap }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{channel.assetCode}</CardTitle>
        <StatusPill channel={channel} />
      </div>
      <KeyValueList className="mt-5">
        <KeyValue label="Held on chain">
          <AmountText units={channel.totalLocked} decimals={channel.decimals} code={channel.assetCode} />
        </KeyValue>
        <KeyValue label="Largest single payout">
          {channel.releaseCap ? (
            <AmountText units={channel.releaseCap} decimals={channel.decimals} code={channel.assetCode} />
          ) : (
            "no limit"
          )}
        </KeyValue>
        <KeyValue label="Token contract">
          <span className="inline-flex items-center gap-1.5">
            <AddressText address={channel.tokenContractId} />
            <CopyButton value={channel.tokenContractId} />
          </span>
        </KeyValue>
        <KeyValue label="Deposits" mono={false}>{channel.depositsBlocked ? "Paused" : "Open"}</KeyValue>
        <KeyValue label="Withdrawals" mono={false}>{channel.withdrawalsBlocked ? "Paused" : "Open"}</KeyValue>
      </KeyValueList>
      {(onPause || onChangeCap) && (
        <div className="mt-5 flex gap-2">
          {onPause && (
            <Button variant="outline" size="sm" onClick={onPause}>
              Pause or resume
            </Button>
          )}
          {onChangeCap && (
            <Button variant="outline" size="sm" onClick={onChangeCap}>
              Change payout limit
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function StatusPill({ channel }: { channel: Channel }) {
  if (channel.status === "provisioning") return <Pill tone="warn">Waiting for chain</Pill>;
  if (channel.depositsBlocked || channel.withdrawalsBlocked) return <Pill tone="warn">Partly paused</Pill>;
  return <Pill tone="ok">Live</Pill>;
}
