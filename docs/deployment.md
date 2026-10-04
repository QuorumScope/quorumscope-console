# Deployment

The console has not been deployed. No public URL exists, and none is recorded here.

## Configuration

One public variable is used:

- `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL`: origin of the real engine API. It is read at build and request time. Without it the console renders an explicit unavailable state and does not fall back to localhost.

## Requirements before deploying

- A reachable `quorumscope-engine` deployment.
- The engine CORS allowlist must include the console origin if the browser calls the API directly. Current pages fetch on the server.
- A hosting account for a Next.js platform. Vercel is the default target and needs the account owner's authorization.

Run `corepack pnpm build` locally with the production API URL before deploying.
