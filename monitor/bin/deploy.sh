#!/usr/bin/env bash
set -euo pipefail
# Run this after save-review.sh, once you're happy with what's approved:
# regenerates the live site from the database and pushes it. Nothing here
# skips the publish pipeline's own safety checks (monitor/publish/validate.js,
# shrinkGuard.js) — a bad publish still aborts with no files changed.
DATA_DIR="${GOVBABU_DATA_DIR:-$HOME/Desktop/govbabu-data}"
MONITOR_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$(cd "$MONITOR_DIR/.." && pwd)"

echo "Regenerating the site from $DATA_DIR/monitor.sqlite3 ..."
cd "$MONITOR_DIR"
MONITOR_DB_PATH="$DATA_DIR/monitor.sqlite3" node bin/publish.js

cd "$SITE_DIR"
git add data/exams.json data/applications.generated.js exams/ sitemap.xml
if git diff --cached --quiet; then
  echo "No site changes to deploy."
  exit 0
fi
git commit -m "Publish: $(date -u +%Y-%m-%dT%H:%M:%SZ) exam data update"
echo ""
echo "Committed locally. Review with 'git show', then push yourself with:"
echo "  git push"
