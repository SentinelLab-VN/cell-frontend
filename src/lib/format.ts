const ADDRESS = /^G[A-Z2-7]{55}$/;

export const isStellarAddress = (value: string) => ADDRESS.test(value);

/** GBXK…7QZM */
export function shortAddress(address: string, edge = 4): string {
  return address.length <= edge * 2 + 1 ? address : `${address.slice(0, edge)}…${address.slice(-edge)}`;
}

export const shortHash = (hash: string) => shortAddress(hash, 4).toLowerCase();

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "never";
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

export function clockTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date().toDateString() === date.toDateString();
  return today
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
    : date.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

/** Stroops of XLM -> "8.42 XLM". */
export function formatXlm(stroops: number | null | undefined): string {
  if (stroops == null) return "not funded";
  return `${(stroops / 10_000_000).toFixed(2)} XLM`;
}
