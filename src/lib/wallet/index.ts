import { freighter } from "./freighter";
import type { WalletProvider } from "./types";

export * from "./types";
export { DEV_WALLET_ENABLED, devWallet } from "./dev";

const soon = (id: string, name: string): WalletProvider => ({
  id,
  name,
  comingSoon: true,
  connect: () => Promise.reject(new Error(`${name} is not supported yet.`)),
});

export const walletProviders: WalletProvider[] = [
  freighter,
  soon("xbull", "xBull"),
  soon("albedo", "Albedo"),
  soon("lobstr", "Lobstr"),
];
