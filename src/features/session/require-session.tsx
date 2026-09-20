import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "./use-session";

export function RequireSession() {
  const session = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
