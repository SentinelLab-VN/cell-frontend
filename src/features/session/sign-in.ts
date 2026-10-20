import { authApi, referralApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearReferral, pendingReferral } from "@/lib/referral";
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

  // Best effort: a failed attribution must never block a sign-in. A 4xx means the
  // code is unknown or paused, so it is dropped; anything else is retried next time.
  const ref = pendingReferral();
  if (ref) {
    referralApi
      .attribute(ref)
      .then(clearReferral)
      .catch((error) => {
        if (error instanceof ApiError && error.status < 500) clearReferral();
      });
  }
}

export function signOut() {
  walletStore.clear();
  sessionStore.clear();
}
