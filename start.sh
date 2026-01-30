#!/bin/sh
set -e
cd "$(dirname "$0")/frontend"

# Railway sets PORT - must use it. Next.js binds to 0.0.0.0 for external access.
export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"

exec npx next start
