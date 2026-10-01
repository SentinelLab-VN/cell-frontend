import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type BrandSize = "topbar" | "sidebar" | "mobile";

// Mark and wordmark sizes per placement. The wordmark is sized so its cap height sits level with the mark's hexagon;
// the top bar steps down on phones, where it shares the row with the network pill and the wallet chip.
const sizes: Record<BrandSize, { mark: string; text: string }> = {
  topbar: { mark: "size-9 md:size-12", text: "text-[24px] md:text-[32px]" },
  sidebar: { mark: "size-11", text: "text-[29px]" },
  mobile: { mark: "size-9", text: "text-[24px]" },
};

export function Brand({ to = "/home", size = "topbar" }: { to?: string; size?: BrandSize }) {
  const { mark, text } = sizes[size];
  return (
    <Link to={to} className="inline-flex shrink-0 items-center gap-2.5 md:gap-3" aria-label="Cell">
      <img src="/logo.png" alt="" width={48} height={48} className={cn("shrink-0 object-contain", mark)} />
      <span className={cn("leading-none font-semibold tracking-[-0.01em] text-foreground", text)}>Cell</span>
    </Link>
  );
}
