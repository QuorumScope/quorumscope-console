# Deployment

## Staging

A staging deployment exists. It runs against Stellar testnet and is not a production site.

| Part | Where | Notes |
| --- | --- | --- |
| Console | https://quorumscope-console.vercel.app (Vercel, Hobby team, project `quorumscope-console`, root directory `apps/web`) | Built from `QuorumScope/quorumscope-console` on `main` with a build command that builds the SDK first. |
| Engine API and indexer | https://quorumscope-engine-api.onrender.com (Render free web service) | Built from the engine's `Dockerfile`. One process group runs the indexer in the background and the API in the foreground. |
| PostgreSQL | Supabase free project, session pooler | Supabase's direct host is IPv6 only and Render's free plan has no IPv6, so the engine uses the pooler host. |

Settings in use: the console has `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` set to the engine URL above, and the engine has `ALLOWED_ORIGINS` set to the console URL and `VERIFIED_PROTOCOL_MAX=28`. The database URL is a secret held only in the Render service settings.

Limits of this staging setup:

- Render's free web service sleeps after 15 minutes without requests. The indexer stops while it sleeps, so freshness turns `stale` until a request wakes it and the indexer polls again. The first request after sleep can take a minute. For a standing deployment, run the indexer as its own background worker on a paid plan.
- A Render deploy is marked failed if the first start fails, and a sleeping service then restarts from that failed deploy. After fixing a bad `DATABASE_URL`, trigger a new deploy with Manual Deploy.
- Vercel has no GitHub access to the QuorumScope organization by default. The Vercel GitHub app was installed on the organization so the project deploys from the original repository and redeploys on each push to `main`.

Verified on staging on 2026-10-05: see [testing.md](testing.md).

## What gets deployed

- The engine API (`quorumscope-engine`) with PostgreSQL and a running indexer. The console needs a reachable engine and does nothing useful without one.
- The console, a Next.js application in `apps/web`. Vercel is the default target and needs the account owner's authorization. Any host that runs `next start` on Node 24 works.

## Environment variables

Console, one public variable:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` | Origin of the engine API, for example `https://api.staging.example.org`. Required. |

It is read in three places, so set it before building and keep it the same at run time:

- The browser bundle inlines it at build time. The preflight form posts to this origin.
- The server reads it on each request to fetch state for the read pages.
- `next.config.ts` reads it at build time to build the content security policy.

Without it the read pages show an explicit unavailable state and the preflight form says the API is not configured. There is no localhost fallback. Use the engine's public origin with no path and no trailing slash. The console does not need any secret, and no private value may use the `NEXT_PUBLIC_` prefix.

Engine settings the console depends on (set on the engine, see its README):

| Variable | Why the console cares |
| --- | --- |
| `ALLOWED_ORIGINS` | Must contain the console origin. Without it the browser blocks the preflight request. |
| `VERIFIED_PROTOCOL_MAX` | Decides whether the console shows the `unverified_protocol` warning. It defaults to 28. |
| `STALE_AFTER_SEC`, `MAX_LAG_LEDGERS` | Decide when the freshness panel says `stale` or `indexing_behind`. |

## Content security policy

The policy is set in `apps/web/next.config.ts` and computed when the app is built:

- `default-src 'self'`, scripts and styles from the page origin plus inline (Next.js needs inline scripts), images from the page origin and `data:`, no frames, no objects, `base-uri` and `form-action` limited to the page origin.
- `connect-src` allows the page origin and the engine origin taken from `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` at build time, and nothing else. A browser fetch to any other origin is blocked.

Changing the engine URL means rebuilding the console, not only restarting it. If the host injects the variable only at run time, the browser bundle and the policy will be wrong. The policy was checked against a real local engine: a fetch to another origin was blocked and the engine origin was allowed.

Other headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`.

## CORS on the engine

The preflight form calls the engine from the browser, so the engine must send CORS headers for the console origin. Set `ALLOWED_ORIGINS` on the engine to the exact console origin, with scheme and no trailing slash. Several origins are comma separated. The engine allows `GET` and `POST` with a `Content-Type` header and exposes `x-request-id`. If the list is empty the engine sends no CORS headers and preflight fails in the browser while the read pages keep working, because those fetch on the server.

## Transaction privacy

A transaction pasted into the preflight form goes from the browser straight to the engine API by POST. It does not pass through the console server, so the console cannot log it. It is not put in the URL, local storage, session storage, or a cookie. The console has no analytics or error reporting. The engine does not log or store the transaction either. Do not put a proxy or logging middleware in front of the engine that records request bodies.

## Staging checklist

Do these in order.

1. Deploy the engine API and PostgreSQL. Set `DATABASE_URL`, `STELLAR_RPC_URL`, `NETWORK_NAME`, `NETWORK_PASSPHRASE`, `ALLOWED_ORIGINS` (the console origin), and optionally `VERIFIED_PROTOCOL_MAX`.
2. Run migrations: `quorumscope init`. (`serve` also applies them at start.)
3. Run a one-shot index: `quorumscope index once`. Confirm `GET /health/ready` returns 200 and `GET /api/v1/status` returns a checkpoint.
4. Start watch mode as a long-running process: `quorumscope index watch`. Confirm the checkpoint advances and `freshness.status` is `current`.
5. Start the engine API: `quorumscope serve`. Confirm `GET /openapi.json` matches `packages/sdk/openapi/quorumscope-engine-v1.json` in this repository, or refresh the snapshot with `pnpm openapi:fetch` and `pnpm openapi:generate` and review the diff.
6. Build the console with `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL` set to the engine origin: `corepack pnpm build`. Deploy the build.
7. Open the console. Check that the overview shows the freshness panel as `Current` and shows the network name.
8. If the network protocol is above `VERIFIED_PROTOCOL_MAX`, confirm the `unverified_protocol` warning shows on the overview, network, keys, preflight, and status pages. If the protocol is at or below the maximum, confirm the warning is absent.
9. Run a preflight with a synthetic transaction. Confirm the result arrives, the request goes to the engine origin, and nothing is sent to the console server. `pnpm live:check` automates this: `QS_CONSOLE_URL=<console> QS_ENGINE_URL=<engine> QS_XDR_FILE=<file> pnpm live:check`.
10. Check the response headers of a console page for the content security policy, and confirm `connect-src` lists only the console and engine origins.
11. Check the light and dark themes and a narrow screen.
12. Only then record the real console URL in the README. Do not record a URL before this point.

## What this checklist does not prove

Testnet has had an empty freeze set during every check so far. A staging run against a network with frozen keys, bypasses, or freeze episodes has not been done.
