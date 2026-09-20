import { authApi } from "@/lib/api/auth";
import type { Wallet } from "@/lib/wallet";
import { sessionStore } from "./session-store";
import { walletStore } from "./wallet-store";

/** Nobody signs up. Signing the server's challenge is the whole of it. */
export async function signIn(wallet: Wallet, devSecret?: string) {
  const { nonce } = await authApi.challenge(wallet.address);
  const signature = await wallet.signMessage(nonce);
  const { token } = await authApi.verify(wallet.address, nonce, signature);

  walletStore.set(wallet, devSecret);
  sessionStore.set({ token, address: wallet.address, providerId: wallet.providerId });
}

export function signOut() {
  walletStore.clear();
  sessionStore.clear();
}
