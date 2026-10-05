# Deployment

The console has not been deployed. No public URL exists, and none is recorded here.

## Configuration

One public variable is used:

- `NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL`: origin of the real engine API. It is inlined into the browser bundle at build time and also read at request time. Build with the real value. The content security policy allows browser connections to this origin only. Without it the console renders an explicit unavailable state and does not fall back to localhost.

## Requirements before deploying

- A reachable `quorumscope-engine` deployment.
- The engine `ALLOWED_ORIGINS` setting must include the console origin. The preflight form posts to the engine from the browser, and read pages fetch on the server.
- A hosting account for a Next.js platform. Vercel is the default target and needs the account owner's authorization.

Run `corepack pnpm build` locally with the production API URL before deploying.
