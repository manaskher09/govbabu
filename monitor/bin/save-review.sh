#!/usr/bin/env bash
set -euo pipefail
# Run this after you're done approving/rejecting in the dashboard. Your
# approvals only exist in the local monitor.sqlite3 until this commits and
# pushes them to the private govbabu-data repo — skip it, and tomorrow's
# automated check starts from the OLD (pre-approval) database and will
# overwrite what you just did.
DATA_DIR="${GOVBABU_DATA_DIR:-$HOME/Desktop/govbabu-data}"

cd "$DATA_DIR"
git add monitor.sqlite3
if git diff --cached --quiet; then
  echo "No review changes to save."
  exit 0
fi
git commit -m "Review session: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push
echo "Saved and pushed — safe for tomorrow's automated check to build on."
