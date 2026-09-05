#!/usr/bin/env bash
set -euo pipefail
# Run this once each morning: pulls the private data repo (updated overnight
# by .github/workflows/daily-sanity-check.yml) and (re)starts the admin
# dashboard pointed at it. See monitor/README.md's "Daily automated check".
DATA_DIR="${GOVBABU_DATA_DIR:-$HOME/Desktop/govbabu-data}"
MONITOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${MONITOR_ADMIN_PORT:-8745}"

if [ ! -d "$DATA_DIR/.git" ]; then
  echo "No private data repo found at $DATA_DIR."
  echo "Clone it once with: git clone https://github.com/manaskher09/govbabu-data.git \"$DATA_DIR\""
  exit 1
fi

echo "Pulling latest results from $DATA_DIR ..."
git -C "$DATA_DIR" pull --ff-only

EXISTING_PIDS="$(lsof -ti:"$PORT" 2>/dev/null || true)"
if [ -n "$EXISTING_PIDS" ]; then
  echo "Stopping admin server already running on port $PORT (pid(s): $(echo "$EXISTING_PIDS" | tr '\n' ' ')) ..."
  echo "$EXISTING_PIDS" | xargs kill
  sleep 1
fi

echo "Starting admin dashboard on http://localhost:$PORT ..."
cd "$MONITOR_DIR"
MONITOR_DB_PATH="$DATA_DIR/monitor.sqlite3" nohup node admin/server.js > /tmp/govbabu-admin.log 2>&1 &
disown
sleep 1
if curl -s -o /dev/null -w '' "http://localhost:$PORT/api/admin/me" 2>/dev/null; then
  echo "Ready — open http://localhost:$PORT and review the queue."
else
  echo "Something didn't start cleanly — check /tmp/govbabu-admin.log"
  exit 1
fi
