import { Button } from "@/components/ui/button";

interface ChainButtonProps {
  label: string;
  /** The wallet is signing, or the network has not settled it yet. */
  submitting: boolean;
  /** Settled on chain; the indexer has not reported it yet. */
  confirming: boolean;
  disabled?: boolean;
}

/** The call to action of a setup step, which stays busy until the indexer has seen the result. */
export function ChainButton({ label, submitting, confirming, disabled }: ChainButtonProps) {
  return (
    <Button type="submit" size="lg" block loading={submitting || confirming} disabled={disabled}>
      {confirming ? "Confirming on chain…" : submitting ? "Waiting for the network…" : label}
    </Button>
  );
}
