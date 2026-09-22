import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Stellar's testnet faucet. It funds an account in one ledger, for free. */
const FRIENDBOT = "https://friendbot.stellar.org";
const LAB_FUND = "https://lab.stellar.org/account/fund";
/**
 * Funds the connected wallet from the testnet faucet.
 *
 * A wallet with no XLM cannot pay a transaction fee, so nothing in Cell works
 * until this has been done once — and nothing on the screen says so unless we
 * do. Off testnet there is no faucet and the button is not rendered.
 */
export function FaucetButton({ address, size = "md" }: { address: string; size?: "sm" | "md" | "lg" }) {
  const fund = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${FRIENDBOT}/?addr=${address}`);
      if (!response.ok && response.status !== 400) throw new Error(`the faucet answered ${response.status}`);
      // 400 is what it returns for an account it has already funded.
      return response.status === 400 ? "already" : "funded";
    },
    onSuccess: (result) =>
      result === "funded"
        ? toast.success("10,000 test XLM sent — it lands in a few seconds")
        : toast.info("This wallet has already been funded by the faucet"),
    onError: (error) => toast.error(`The faucet did not answer: ${error.message}`),
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size={size} variant="secondary" loading={fund.isPending} onClick={() => fund.mutate()}>
        Get test XLM
      </Button>
      <a
        href={LAB_FUND}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Stellar Lab faucet
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </div>
  );
}
