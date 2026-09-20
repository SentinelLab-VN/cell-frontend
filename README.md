# Cell — web app

The web app for Cell: a member's wallet space, the operator console, and the
wizard that takes a tenant from nothing to live.

## Run it

```sh
pnpm install
cp .env.example .env      # point VITE_GATEWAY_URL at a running gateway
pnpm dev                  # http://localhost:5173
```

The dev server proxies `/api` and `/auth` to the gateway, so the browser only
ever talks to one origin. In production, serve `dist/` behind the same host as
the gateway, or proxy those two prefixes to it.

| Script | What it does |
| --- | --- |
| `pnpm dev` / `build` / `preview` | Vite |
| `pnpm typecheck` / `lint` | `tsc`, `oxlint` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm e2e` | The whole product in a browser, against a real gateway and testnet |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from the gateway's OpenAPI document |

## How the code is laid out

```
src/
  lib/            No React in here.
    api/          One file per area of the API. `client.ts` is the only place that calls fetch.
    wallet/       The `Wallet` interface and its providers (Freighter, and a dev wallet).
    stellar/      Building transactions, the signed-message formats, the RPC client.
    amount.ts     Money is a string of whole units, handled with BigInt. Never a float.
  components/
    ui/           Small presentational pieces: Button, Card, Dialog, Field, Pill, Timeline…
    layout/       The app shell, the top bar, the page header.
  features/       One folder per part of the product. A feature owns its pages, dialogs and hooks.
    session/      Who is signed in, and with which wallet.
    connect/  home/  onboarding/  wallet-space/  console/
    tenant/       Loading the tenant in the URL; the shared queries and their keys.
    chain/        `useSubmitTx`: prepare → wallet signs → submit. Every admin action is this.
  router.tsx      Every route, in one place.
```

Three rules keep it easy to change:

- **Pages do not call `fetch`.** They call `lib/api`, through TanStack Query. Query
  keys live in `features/tenant/queries.ts`, and everything under a tenant shares
  the `["tenant", id]` prefix, so one invalidation refreshes it all.
- **Nothing outside `lib/wallet` knows which wallet is connected.** Adding one is a
  new file implementing `Wallet`, and a line in `lib/wallet/index.ts`.
- **Amounts stay strings** from the API to the screen. `lib/amount.ts` parses what
  a person types and formats what they read.

## Wallets and signing

Wallets sign text the SEP-53 way, and the gateway verifies it that way. The two
messages a member signs — a transfer and a withdrawal request — are built in
`lib/stellar/messages.ts`; the gateway rebuilds the same string, so that file and
the gateway must agree to the character.

The **development wallet** signs with a secret seed typed into the connect
screen. It exists for local work and for `pnpm e2e`, and only when
`VITE_ENABLE_DEV_WALLET=true`. Leave it unset in any build that real people use.

## End-to-end test

`e2e/full-flow.spec.ts` deploys an escrow, opens XLM, adds and funds the
operator, deposits, sends to a new address, withdraws, approves, and waits for
the payout to land on chain. It needs the local stack running, two funded
testnet accounts, and the admin on the tenant-creators allowlist:

```sh
CELL_E2E_ADMIN_SECRET=S… CELL_TESTNET_USER_SECRET=S… pnpm e2e
```

Set `CELL_E2E_SHOTS=<dir>` to save a screenshot of every screen along the way.
