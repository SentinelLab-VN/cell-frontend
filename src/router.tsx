import { createBrowserRouter, Navigate } from "react-router-dom";
import { ConnectPage } from "@/features/connect/connect-page";
import { AccountsPage } from "@/features/console/accounts-page";
import { AuditPage } from "@/features/console/audit-page";
import { ChannelsPage } from "@/features/console/channels-page";
import { ConsoleLayout } from "@/features/console/console-layout";
import { ContractPage } from "@/features/console/contract-page";
import { OverviewPage } from "@/features/console/overview-page";
import { WithdrawalsPage } from "@/features/console/withdrawals-page";
import { HomePage } from "@/features/home/home-page";
import { SetupPage } from "@/features/onboarding/setup-page";
import { RequireSession } from "@/features/session/require-session";
import { ActivityPage } from "@/features/wallet-space/activity-page";
import { BalancesPage } from "@/features/wallet-space/balances-page";
import { DepositPage } from "@/features/wallet-space/deposit-page";
import { SendPage } from "@/features/wallet-space/send-page";
import { WalletSpaceLayout } from "@/features/wallet-space/wallet-space-layout";
import { WithdrawPage } from "@/features/wallet-space/withdraw-page";

export const router = createBrowserRouter([
  { path: "/", element: <ConnectPage /> },
  {
    element: <RequireSession />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/tenants/new", element: <SetupPage /> },
      { path: "/tenants/:tenantId/setup", element: <SetupPage /> },
      {
        path: "/t/:tenantId",
        element: <WalletSpaceLayout />,
        children: [
          { index: true, element: <BalancesPage /> },
          { path: "send", element: <SendPage /> },
          { path: "deposit", element: <DepositPage /> },
          { path: "withdraw", element: <WithdrawPage /> },
          { path: "activity", element: <ActivityPage /> },
        ],
      },
      {
        path: "/t/:tenantId/console",
        element: <ConsoleLayout />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: "channels", element: <ChannelsPage /> },
          { path: "withdrawals", element: <WithdrawalsPage /> },
          { path: "accounts", element: <AccountsPage /> },
          { path: "contract", element: <ContractPage /> },
          { path: "audit", element: <AuditPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
