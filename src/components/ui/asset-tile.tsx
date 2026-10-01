import { cn } from "@/lib/cn";

type TileSize = 36 | 32 | 26;

// Radius and code size scale together so the tile keeps the same optical weight at each size.
const metrics: Record<TileSize, string> = {
  36: "size-9 rounded-[10px] text-[12px]",
  32: "size-8 rounded-[9px] text-[11px]",
  26: "size-[26px] rounded-[7px] text-[10px]",
};

/** Square tile carrying an asset code (or a wallet-provider initial). */
export function AssetTile({ code, size = 36, className }: { code: string; size?: TileSize; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "num inline-flex shrink-0 items-center justify-center overflow-hidden border border-border-strong bg-secondary font-semibold text-foreground",
        metrics[size],
        className,
      )}
    >
      {code.slice(0, 4)}
    </span>
  );
}
