import { useState } from "react";
import { useConfig } from "@/features/tenant/queries";

const TESTNET = "Test SDF Network ; September 2015";

/** The faucet only exists on testnet; off it, nothing here should be offered. */
export function useIsTestnet(): boolean {
  const { data } = useConfig();
  return data?.networkPassphrase === TESTNET;
}

/** Whether a tenant has ever taken money, from the overview's channel rows. */
export function hasAnyDeposit(channels: { totalLocked: string }[] | undefined): boolean {
  return (channels ?? []).some((c) => BigInt(c.totalLocked) > 0n);
}

/** A card the user can hide for good. Without storage it just comes back next visit. */
export function useDismissed(key: string): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });
  const dismiss = () => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };
  return [dismissed, dismiss];
}
