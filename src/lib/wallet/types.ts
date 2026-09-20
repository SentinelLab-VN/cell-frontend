/** A connected wallet. The app never sees a key: it asks for signatures. */
export interface Wallet {
  readonly providerId: string;
  readonly address: string;
  /** Signs text per SEP-53. Resolves to the 64-byte signature, hex encoded. */
  signMessage(message: string): Promise<string>;
  /** Signs a transaction envelope. Resolves to the signed envelope, base64 XDR. */
  signTransaction(xdr: string, networkPassphrase: string): Promise<string>;
}

export interface WalletProvider {
  readonly id: string;
  readonly name: string;
  readonly hint?: string;
  /** Listed but not wired up yet. */
  readonly comingSoon?: boolean;
  connect(): Promise<Wallet>;
}

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}
