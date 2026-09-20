// Amounts travel as integer strings in the asset's smallest unit and are only
// ever handled as BigInt here: a float cannot hold 7 decimals of a large
// balance exactly, and this is money.

export type Stroops = string;

/** "12.5" with 7 decimals -> "125000000". Returns null when it is not a valid amount. */
export function parseAmount(input: string, decimals: number): Stroops | null {
  const text = input.trim().replace(/,/g, "");
  if (!/^\d*\.?\d*$/.test(text) || text === "" || text === ".") return null;

  const [whole = "0", fraction = ""] = text.split(".");
  if (fraction.length > decimals) return null;

  const units = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  return units.toString();
}

/** "125000000" with 7 decimals -> "12.50". Keeps at least `minFraction` decimals. */
export function formatAmount(units: Stroops | bigint, decimals: number, minFraction = 2): string {
  const value = BigInt(units);
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(decimals + 1, "0");

  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, "").padEnd(minFraction, "0");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${negative ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

export const isPositive = (units: Stroops) => BigInt(units) > 0n;
export const gte = (a: Stroops, b: Stroops) => BigInt(a) >= BigInt(b);
export const subtract = (a: Stroops, b: Stroops): Stroops => (BigInt(a) - BigInt(b)).toString();
export const sum = (values: Stroops[]): Stroops => values.reduce((acc, v) => acc + BigInt(v), 0n).toString();
