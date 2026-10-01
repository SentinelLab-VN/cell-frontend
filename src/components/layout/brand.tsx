import { Link } from "react-router-dom";
import { LogoMark } from "./logo-mark";

export function Brand({ to = "/home" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <LogoMark className="size-6 text-primary" />
      <span className="text-[15px] font-semibold text-foreground">Cell</span>
    </Link>
  );
}
