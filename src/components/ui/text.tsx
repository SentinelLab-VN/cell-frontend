import { Check, Copy } from "lucide-react";
import { useState } from "react";
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
  return (
    <span className={cn("num", signed && (negative ? "text-destructive" : "text-success"), className)}>
      {signed && !negative ? "+" : ""}
      {text}
      {code ? ` ${code}` : ""}
    </span>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      className="text-primary transition-opacity hover:opacity-80"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
