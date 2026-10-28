#!/usr/bin/env bash
set -euo pipefail

# Cross-repository deterministic fixture demo. The Engine script owns the temporary database,
# fixture RPC, and API; this wrapper adds the real SDK and Console/browser checks.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENGINE_DIR="${QS_DEMO_ENGINE_DIR:-$ROOT_DIR/../quorumscope-engine}"
STATE_DIR="$(mktemp -d)"
ENGINE_PID=""
CONSOLE_PID=""

cleanup() {
  set +e
  [[ -n "$CONSOLE_PID" ]] && kill "$CONSOLE_PID" 2>/dev/null
  [[ -n "$ENGINE_PID" ]] && kill "$ENGINE_PID" 2>/dev/null
  rm -rf "$STATE_DIR"
}
trap cleanup EXIT INT TERM

[[ -x "$ENGINE_DIR/scripts/demo-nonempty.sh" ]] || {
  echo "Engine demo not found: $ENGINE_DIR/scripts/demo-nonempty.sh" >&2
  exit 1
}

(cd "$ENGINE_DIR" && QS_DEMO_STATE_DIR="$STATE_DIR/engine" ./scripts/demo-nonempty.sh --serve) &
ENGINE_PID=$!
until [[ -f "$STATE_DIR/engine/demo.env" ]]; do
  kill -0 "$ENGINE_PID" 2>/dev/null || { wait "$ENGINE_PID"; exit 1; }
  sleep 1
done
source "$STATE_DIR/engine/demo.env"

export NEXT_PUBLIC_QUORUMSCOPE_API_BASE_URL="$QS_DEMO_API_URL"
corepack pnpm build
corepack pnpm --filter @quorumscope/web exec next start -p 3100 &
CONSOLE_PID=$!
until curl --silent --fail http://127.0.0.1:3100/api/health >/dev/null; do
  sleep 1
done

QS_ENGINE_URL="$QS_DEMO_API_URL" \
QS_CONSOLE_URL=http://127.0.0.1:3100 \
QS_DEMO_FIXTURE="$QS_DEMO_FIXTURE" \
  node "$ROOT_DIR/scripts/demo-check.mjs"

echo
echo "Deterministic fixture demo passed. Synthetic data was not presented as live Testnet state."
