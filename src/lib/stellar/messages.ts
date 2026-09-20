// The exact text a wallet signs to move value inside a channel. The gateway
// rebuilds the same string from the request's fields and checks the signature
// against it, so any difference here — a field order, a date format — is a
// refused transfer, never a wrong one.

const seconds = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

interface Common {
  networkPassphrase: string;
  channelId: string;
  from: string;
  to: string;
  amount: string;
  expiresAt: string;
}

export const transferMessage = (m: Common & { nonce: number }) =>
  `cell:transfer:v1:${m.networkPassphrase}:${m.channelId}:${m.from}:${m.to}:${m.amount}:${m.nonce}:${seconds(m.expiresAt)}`;

export const withdrawalMessage = (m: Common & { requestId: string }) =>
  `cell:withdraw:v1:${m.networkPassphrase}:${m.channelId}:${m.from}:${m.to}:${m.amount}:${m.requestId}:${seconds(m.expiresAt)}`;
