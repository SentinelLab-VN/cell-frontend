import { Keypair } from "@stellar/stellar-sdk";
import { expect, test, type Browser, type Page } from "@playwright/test";

// Needs the local stack, an admin on the tenant-creators allowlist, and both
// accounts funded on testnet:
//   CELL_E2E_ADMIN_SECRET=S… CELL_TESTNET_USER_SECRET=S… pnpm e2e
const ADMIN_SECRET = process.env.CELL_E2E_ADMIN_SECRET ?? "";
const USER_SECRET = process.env.CELL_TESTNET_USER_SECRET ?? "";

test.skip(!ADMIN_SECRET || !USER_SECRET, "needs CELL_E2E_ADMIN_SECRET and CELL_TESTNET_USER_SECRET");

const SHOTS = process.env.CELL_E2E_SHOTS;
const shot = async (page: Page, name: string) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

async function signIn(browser: Browser, secret: string, role: "operator" | "member" = "member"): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(`/start/${role}`);
  await page.getByLabel("Secret seed").fill(secret);
  await page.getByRole("button", { name: "Connect with seed" }).click();
  // An operator with no tenant yet is sent on to the wizard.
  await expect(page).toHaveURL(role === "operator" ? /\/(home|tenants\/new)$/ : /\/home$/);
  return page;
}

test("a tenant goes from nothing to a paid-out withdrawal", async ({ browser }) => {
  const user = Keypair.fromSecret(USER_SECRET).publicKey();
  const tenantName = `E2E ${Date.now()}`;

  const admin = await signIn(browser, ADMIN_SECRET, "operator");

  await test.step("deploy the escrow", async () => {
    await admin.goto("/tenants/new");
    await admin.getByPlaceholder("Acme Pay").fill(tenantName);
    await shot(admin, "01-deploy");
    await admin.getByRole("button", { name: "Sign & deploy escrow" }).click();
    await expect(admin).toHaveURL(/\/tenants\/[^/]+\/setup$/, { timeout: 120_000 });
  });

  await test.step("open XLM, add the operator, fund it", async () => {
    await shot(admin, "02-asset");
    await admin.getByRole("button", { name: /Sign & open XLM/ }).click();
    await admin.getByRole("button", { name: "Sign & add operator" }).waitFor();
    await shot(admin, "03-operator");
    await admin.getByRole("button", { name: "Sign & add operator" }).click();
    await admin.getByRole("button", { name: /Sign & send 10 XLM/ }).waitFor();
    await shot(admin, "04-fund");
    await admin.getByRole("button", { name: /Sign & send 10 XLM/ }).click();
    await expect(admin.getByRole("link", { name: "View as user" })).toBeVisible({ timeout: 180_000 });
  });

  await shot(admin, "05-live");
  const tenantId = admin.url().match(/tenants\/([^/]+)\/setup/)![1];

  await test.step("deposit, then see it credited", async () => {
    await admin.goto(`/t/${tenantId}/deposit`);
    await admin.getByPlaceholder("0.00").fill("5");
    await admin.getByRole("button", { name: "Sign deposit in wallet" }).click();
    await expect(admin.getByText("Deposit credited")).toBeVisible();
    await shot(admin, "06-deposit");
  });

  await test.step("send to someone who has never been here", async () => {
    await admin.goto(`/t/${tenantId}/send`);
    await admin.getByPlaceholder("G… Stellar address").fill(user);
    await admin.getByPlaceholder("0.00").fill("2");
    await admin.getByRole("button", { name: "Sign & send" }).click();
    await expect(admin.getByRole("dialog").getByText(/New here/)).toBeVisible();
    await admin.getByRole("dialog").getByPlaceholder(`…${user.slice(-4)}`).fill(user.slice(-4));
    await admin.waitForTimeout(400);
    await shot(admin, "07-confirm-send");
    await admin.getByRole("dialog").getByRole("button", { name: "Sign & send" }).click();
    await expect(admin.getByText(/Sent/).first()).toBeVisible();
  });

  const member = await signIn(browser, USER_SECRET);

  await test.step("the recipient asks to withdraw", async () => {
    await member.goto(`/t/${tenantId}`);
    await expect(member.getByText("2.00").first()).toBeVisible();
    await member.goto(`/t/${tenantId}/withdraw`);
    await member.getByPlaceholder("0.00").fill("1.5");
    await member.getByRole("button", { name: "Request withdrawal" }).click();
    await expect(member.getByText("Waiting for review")).toBeVisible();
  });

  await test.step("the operator approves it", async () => {
    await admin.goto(`/t/${tenantId}/console/withdrawals`);
    await admin.getByRole("button", { name: "Review" }).click();
    await admin.getByRole("button", { name: "Approve payout" }).click();
    await expect(admin.getByText("Paid out", { exact: true })).toBeVisible({ timeout: 180_000 });
  });

  await test.step("the member sees it paid, and the books agree", async () => {
    await expect(member.getByText("Paid out", { exact: true })).toBeVisible();
    await member.goto(`/t/${tenantId}`);
    await expect(member.getByText("0.50").first()).toBeVisible();

    await shot(member, "08-member-balances");
    await member.goto(`/t/${tenantId}/activity`);
    await expect(member.getByText("Received")).toBeVisible();
    await shot(member, "09-member-activity");

    await admin.goto(`/t/${tenantId}/console`);
    await expect(admin.getByText("3.50").first()).toBeVisible();
    await shot(admin, "10-overview");
    for (const screen of ["channels", "accounts", "contract", "audit"]) {
      await admin.goto(`/t/${tenantId}/console/${screen}`);
      await admin.getByRole("heading", { level: 1 }).waitFor();
      await admin.waitForLoadState("networkidle");
      await shot(admin, `11-${screen}`);
    }
    await admin.goto("/home");
    await expect(admin.getByText(tenantName)).toBeVisible();
    await shot(admin, "12-home");
  });
});
