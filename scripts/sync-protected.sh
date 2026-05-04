#!/usr/bin/env bash
# Sync dist-protected/ to the project's Firebase Storage default bucket.
#
# Run automatically as a Hosting predeploy hook (firebase.json
# hosting.predeploy) AFTER `npm run build:protected` so every
# `firebase deploy --only hosting` uploads the freshly-built protected
# files. This closes the gap Codex flagged on PR #9: without this,
# Storage objects drift from the committed source tree, and a fresh
# environment serves nothing (or stale content) from the bucket.
#
# Phase 3 (#23) of the Vite migration: SRC_DIR moved from `protected/`
# (raw .jsx + portrait) to `dist-protected/`. Phase 4 (#24) flipped
# the build output from `.jsx` (Babel-transformed at runtime) to `.js`
# ES modules with React inlined; the loader now uses blob-URL dynamic
# import. Storage still serves the bucket prefix `protected/` — the
# names changed (`content.js`, `direction-{1,2,3}.js`,
# `sterling-tadlock.png`) but the storage.rules path-prefix match is
# unchanged.
#
# Why rsync with --delete: the bucket should mirror dist-protected/.
# A file removed from protected-src/ (and therefore not emitted into
# dist-protected/) should be removed from the bucket too, or
# storage.rules' allowlist would still serve it indefinitely.
#
# Usage:
#   scripts/sync-protected.sh                 # sync to default bucket
#   BUCKET=other-bucket scripts/sync-protected.sh
#   SRC_DIR=protected scripts/sync-protected.sh   # legacy override
#   DRY_RUN=1 scripts/sync-protected.sh       # show what would change
#   SKIP=1 scripts/sync-protected.sh          # no-op (used by CI / tests)
set -euo pipefail

if [[ "${SKIP:-}" == "1" ]]; then
  echo "[sync-protected] SKIP=1, no-op"
  exit 0
fi

BUCKET="${BUCKET:-tadlockpsychiatry.firebasestorage.app}"
SRC_DIR="${SRC_DIR:-dist-protected}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[sync-protected] $SRC_DIR/ not found — nothing to sync" >&2
  exit 1
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "[sync-protected] gcloud not on PATH; cannot sync" >&2
  exit 1
fi

DRY_FLAG=()
if [[ "${DRY_RUN:-}" == "1" ]]; then
  DRY_FLAG=(--dry-run)
  echo "[sync-protected] DRY_RUN=1 (no changes will be made)"
fi

# rsync with --delete-unmatched-destination-objects so the bucket
# strictly mirrors $SRC_DIR/. If a future commit removes a direction
# file or renames the portrait, the deletion propagates.
#
# --recursive so nested files (none today, but future-safe) are picked
# up. The -- after rsync prevents flag-parsing surprises.
echo "[sync-protected] gcloud storage rsync $SRC_DIR/ gs://$BUCKET/protected/"
# `${arr[@]+"${arr[@]}"}` expands safely under `set -u` when arr is empty.
#
# `--impersonate-service-account=""` drops any impersonation set in the
# active gcloud config. This script gets called from a Hosting predeploy
# hook where the active config may belong to a different project (e.g.
# the developer's last `firebase use` was a different repo), and the
# project-specific deployer SA from that config has no storage.* access
# on this bucket. Using the user's underlying ADC credentials directly
# is portable and matches what an interactive `gcloud storage cp`
# would do without an active impersonation override.
gcloud storage rsync "$SRC_DIR" "gs://$BUCKET/protected" \
  --recursive \
  --delete-unmatched-destination-objects \
  --impersonate-service-account="" \
  ${DRY_FLAG[@]+"${DRY_FLAG[@]}"}

# Apply CORS configuration on every deploy so the bucket's allowed
# origins stay in sync with storage.cors.json. Without this, the
# custom-domain origin (tadlockpsychiatry.com) can't make
# XMLHttpRequest calls to the bucket — the Firebase Storage SDK
# attaches the user's auth token but the browser blocks the
# response on the CORS preflight. Caught in the wild on PR #14.
CORS_FILE="${CORS_FILE:-storage.cors.json}"
if [[ -f "$CORS_FILE" ]]; then
  echo "[sync-protected] applying CORS from $CORS_FILE"
  if [[ "${DRY_RUN:-}" == "1" ]]; then
    echo "[sync-protected] DRY_RUN=1 — skipping CORS apply"
  else
    gcloud storage buckets update "gs://$BUCKET" \
      --cors-file="$CORS_FILE" \
      --impersonate-service-account="" >/dev/null
    echo "[sync-protected] CORS applied"
  fi
else
  echo "[sync-protected] no $CORS_FILE — skipping CORS sync"
fi

echo "[sync-protected] done"
