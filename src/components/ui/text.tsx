import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatAmount } from "@/lib/amount";
import { cn } from "@/lib/cn";
import { shortAddress } from "@/lib/format";

export function AddressText({ address, className }: { address: string; className?: string }) {
  return (
    <span className={cn("num", className)} title={address}>
      {shortAddress(address)}
    </span>
  );
}

interface AmountTextProps {
  units: string;
  decimals: number;
  code?: string;
  signed?: boolean;
  className?: string;
}

export function AmountText({ units, decimals, code, signed = false, className }: AmountTextProps) {
  const negative = units.startsWith("-");
  const text = formatAmount(units, decimals);
  // Zeros beyond the second decimal are padding, not information: dim them so the
  // significant digits read first. The first two decimals always stay solid so
  // "1,240.50" reads as money, not as "1,240.5" with a stray digit.
  const dot = text.indexOf(".");
  const match = dot === -1 ? null : /^(.*?)(0+)$/.exec(text);
  const solidMin = dot + 3;
  const cut = match ? Math.max(match[1].length, solidMin) : text.length;
  const solid = text.slice(0, cut);
  const faded = text.slice(cut);
  return (
    <span className={cn("num", signed && !negative && "text-success", className)}>
      {signed && !negative ? "+" : ""}
      {solid}
      {faded && <span className="text-dim">{faded}</span>}
      {code ? ` ${code}` : ""}
    </span>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-label={label}
      className={cn("inline-flex items-center transition-colors", copied ? "text-success" : "text-dim hover:text-foreground")}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // Clipboard access can be denied (insecure context, permissions); leave the icon unchanged.
          return;
        }
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
    </button>
  );
}
