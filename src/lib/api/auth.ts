import { http } from "./client";

export const authApi = {
  challenge: (address: string) => http.post<{ nonce: string }>("/auth/challenge", { address }),
  verify: (address: string, nonce: string, signature: string) =>
    http.post<{ token: string }>("/auth/verify", { address, nonce, signature }),
};
