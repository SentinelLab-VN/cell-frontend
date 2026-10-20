import { ApiError, http } from "./client";
import type { Referral, ReferralMember } from "./types";

export const authApi = {
  challenge: (address: string) => http.post<{ nonce: string }>("/auth/challenge", { address }),
  verify: (address: string, nonce: string, signature: string) =>
    http.post<{ token: string }>("/auth/verify", { address, nonce, signature }),
};

export const referralApi = {
  attribute: (code: string) => http.post<{ attributed: boolean }>("/api/referrals/attribute", { code }),
  /** `null` until the wallet has minted a code. */
  mine: async (): Promise<Referral | null> => {
    try {
      return await http.get<Referral>("/api/referrals/me");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  /** Mints the wallet's code, or returns the one it already has. */
  create: () => http.post<Referral>("/api/referrals/me"),
  members: () => http.get<ReferralMember[]>("/api/referrals/me/members"),
};
