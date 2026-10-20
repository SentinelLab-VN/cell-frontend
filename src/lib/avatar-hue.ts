/** Deterministic avatar colouring: the same name always lands on the same hue. */

/** FNV-1a style string hash mapped onto 0-359, so similar names still spread across the wheel. */
export function avatarHue(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 360;
}

/** "Acme Pay" -> "AP", "acme" -> "AC". Falls back to "?" for an empty name. */
export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return letters.toUpperCase();
}

/** Two Base32 characters of a G-address. The leading "G" is the same on every account, so it is skipped. */
export function addressInitials(gAddress: string): string {
  const body = gAddress.startsWith("G") ? gAddress.slice(1) : gAddress;
  return body.slice(0, 2).toUpperCase() || "?";
}
