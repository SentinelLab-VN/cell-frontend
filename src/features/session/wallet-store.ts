import { DEV_WALLET_ENABLED, devWallet, walletProviders, WalletError, type Wallet } from "@/lib/wallet";
import { sessionStore } from "./session-store";

// A wallet is a live object and cannot be stored, so after a reload it is
// reconnected the first time a signature is needed.

const DEV_SECRET_KEY = "cell.dev-secret";
let connected: Wallet | null = null;

export const walletStore = {
  set(wallet: Wallet, devSecret?: string) {
    connected = wallet;
    if (devSecret && DEV_WALLET_ENABLED) sessionStorage.setItem(DEV_SECRET_KEY, devSecret);
  },

  clear() {
    connected = null;
    sessionStorage.removeItem(DEV_SECRET_KEY);
  },

  /** The wallet of the signed-in session, reconnecting it if the page was reloaded. */
  async require(): Promise<Wallet> {
    const session = sessionStore.get();
    if (!session) throw new WalletError("Connect a wallet first.");
    if (connected?.address === session.address) return connected;

    const restored = await reconnect(session.providerId);
    if (restored.address !== session.address) {
      throw new WalletError("The wallet is on a different account than the one signed in.");
    }
    connected = restored;
    return restored;
  },
};

async function reconnect(providerId: string): Promise<Wallet> {
  if (providerId === "dev") {
    const secret = sessionStorage.getItem(DEV_SECRET_KEY);
    if (!secret) throw new WalletError("Sign in again to keep using the development wallet.");
    return devWallet(secret);
  }
  const provider = walletProviders.find((p) => p.id === providerId);
  if (!provider) throw new WalletError("Unknown wallet. Sign in again.");
  return provider.connect();
}
