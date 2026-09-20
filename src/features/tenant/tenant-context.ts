import { useOutletContext } from "react-router-dom";
import type { Tenant } from "@/lib/api/types";

/** Every screen under `/t/:tenantId` is rendered with its tenant already loaded. */
export const useCurrentTenant = () => useOutletContext<Tenant>();
