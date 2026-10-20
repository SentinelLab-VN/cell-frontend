import { TableWrap, THead, Td, Th, Tr } from "@/components/ui/table";
import { AmountText } from "@/components/ui/text";
import type { ActivityRow, BalanceRow } from "@/lib/api/types";
import { clockTime } from "@/lib/format";
import { useIsDesktop } from "@/lib/use-media-query";
import { kindOf } from "./activity-kind";

interface ActivityListProps {
  rows: ActivityRow[];
  balances?: BalanceRow[];
}

function amountOf(row: ActivityRow, balances?: BalanceRow[]) {
  const asset = balances?.find((b) => b.channelId === row.channelId);
  return (
    <AmountText
      units={row.amount}
      decimals={asset?.decimals ?? 7}
      code={asset?.assetCode}
      signed
    />
  );
}

/**
 * One data set, two presentations: a table from md up, a compact list on
 * phones. Only one is mounted at a time so every row's text exists once.
 */
export function ActivityList({ rows, balances }: ActivityListProps) {
  const desktop = useIsDesktop();
  if (desktop) {
    return (
      <TableWrap>
        <THead>
          <tr>
            <Th>Type</Th>
            <Th className="text-right">Amount</Th>
            <Th className="text-right">When</Th>
          </tr>
        </THead>
        <tbody>
          {rows.map((row) => {
            const kind = kindOf(row);
            return (
              <Tr key={row.seq}>
                <Td>
                  <span className="flex items-center gap-2.5 font-medium">
                    <kind.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    {kind.label}
                  </span>
                </Td>
                <Td className="text-right">{amountOf(row, balances)}</Td>
                <Td className="text-right text-[15px] text-muted-foreground">
                  {clockTime(row.createdAt)}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </TableWrap>
    );
  }
  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card">
      {rows.map((row) => {
        const kind = kindOf(row);
        return (
          <li
            key={row.seq}
            className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3.5 first:border-t-0"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-secondary text-muted-foreground">
              <kind.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {kind.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {clockTime(row.createdAt)}
              </p>
            </div>
            <span className="text-sm">{amountOf(row, balances)}</span>
          </li>
        );
      })}
    </ul>
  );
}
