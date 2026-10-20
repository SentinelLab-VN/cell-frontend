import { Avatar } from "@/components/ui/avatar";
import { Card, CardTitle } from "@/components/ui/card";
import { shortAddress } from "@/lib/format";

/** Addresses this member has sent to before; a click fills the "To" field. */
export function SendRecentCard({ addresses, onPick }: { addresses?: string[]; onPick: (address: string) => void }) {
  return (
    <Card>
      <CardTitle>Recent</CardTitle>
      <ul className="mt-4 space-y-1">
        {addresses?.length === 0 && <li className="text-[15px] text-dim">Nobody yet.</li>}
        {addresses?.map((address) => (
          <li key={address}>
            <button
              type="button"
              onClick={() => onPick(address)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary"
            >
              <Avatar address={address} size={26} />
              <span className="num text-[15px] text-foreground">{shortAddress(address)}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
