#!/bin/sh
# Restart contract for the FREEV workspace: bring the dev server back up on
# 0.0.0.0:8080 after a hibernate/revive. Idempotent and non-blocking.
cd "$(dirname "$0")" || exit 0

if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi

npm run dev > /tmp/freev-dev.log 2>&1 &
exit 0
