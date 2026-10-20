import type { CSSProperties } from "react";
import { addressInitials, avatarHue, initialsFor } from "@/lib/avatar-hue";
import { cn } from "@/lib/cn";

type AvatarProps = { size?: number; className?: string } & ({ name: string; address?: never } | { address: string; name?: never });

/** Generated identity: a tenant name or a G-address becomes a tinted circle with two letters. */
export function Avatar({ name, address, size = 28, className }: AvatarProps) {
  const seed = address ?? name ?? "";
  const hue = avatarHue(seed);
  const style: CSSProperties = {
    width: size,
    height: size,
    // Roughly 38% of the diameter keeps two letters comfortably inside the circle.
    fontSize: Math.max(8, Math.round(size * 0.38)),
    background: `oklch(0.35 0.08 ${hue})`,
    color: `oklch(0.88 0.12 ${hue})`,
  };
  return (
    <span
      aria-hidden
      style={style}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full leading-none font-semibold select-none", address && "num", className)}
    >
      {address ? addressInitials(address) : initialsFor(name ?? "")}
    </span>
  );
}
