import { useState } from "react";
import { useBalances } from "@/features/tenant/queries";

/** The caller's balances in this tenant, and which asset the form is about. */
export function useChannelChoice(tenantId: string, poll = false) {
  const balances = useBalances(tenantId, poll);
  const [chosen, setChosen] = useState<string>();

  const rows = balances.data ?? [];
  const selected = rows.find((row) => row.channelId === chosen) ?? rows[0];

  return { balances, rows, selected, choose: setChosen };
}
