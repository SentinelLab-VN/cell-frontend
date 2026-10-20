import { ChevronDown } from "lucide-react";
import { Field, Input } from "@/components/ui/field";

interface Props {
  assets: string[];
  code: string;
  onCode: (code: string) => void;
  issuer: string;
  onIssuer: (issuer: string) => void;
  needsIssuer: boolean;
  disabled?: boolean;
}

/** The asset code from the deployment's list, plus the issuer when it is an issued asset. */
export function AssetPicker({ assets, code, onCode, issuer, onIssuer, needsIssuer, disabled }: Props) {
  return (
    <>
      <Field label="Asset" hint={`This deployment takes ${assets.join(", ")}.`}>
        <span className="relative flex items-center">
          <select
            name="asset"
            aria-label="Asset"
            className="h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-border-strong bg-card pr-9 pl-3.5 text-[15px] text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            value={code}
            disabled={disabled}
            onChange={(event) => onCode(event.target.value)}
          >
            {assets.map((asset) => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 size-3.5 text-dim" aria-hidden />
        </span>
      </Field>
      {needsIssuer && (
        <Field label="Issuer" hint={`The Stellar account that issues ${code}. Prefilled for the network's well-known one.`}>
          <Input name="issuer" placeholder="G…" value={issuer} disabled={disabled} onChange={(event) => onIssuer(event.target.value.trim())} />
        </Field>
      )}
    </>
  );
}
