#!/usr/bin/env bash
# Sync protected/ to the project's Firebase Storage default bucket.
#
# Run automatically as a Hosting predeploy hook (firebase.json
# hosting.predeploy) so every `firebase deploy --only hosting` first
# uploads the latest protected files. This closes the gap Codex
# flagged on PR #9: without this, Storage objects drift from the
# committed protected/ tree, and a fresh environment serves nothing
# (or stale content) from the bucket.
#
# Why rsync with --delete: the bucket should mirror committed protected/.
# A file removed from the repo should be removed from the bucket too,
# or storage.rules' allowlist would still serve it indefinitely.
#
# Usage:
#   scripts/sync-protected.sh                 # sync to default bucket
#   BUCKET=other-bucket scripts/sync-protected.sh
#   DRY_RUN=1 scripts/sync-protected.sh       # show what would change
#   SKIP=1 scripts/sync-protected.sh          # no-op (used by CI / tests)
set -euo pipefail

if [[ "${SKIP:-}" == "1" ]]; then
  echo "[sync-protected] SKIP=1, no-op"
  exit 0
fi

BUCKET="${BUCKET:-tadlockpsychiatry.firebasestorage.app}"
SRC_DIR="${SRC_DIR:-protected}"

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
gcloud storage rsync "$SRC_DIR" "gs://$BUCKET/protected" \
  --recursive \
  --delete-unmatched-destination-objects \
  ${DRY_FLAG[@]+"${DRY_FLAG[@]}"}

echo "[sync-protected] done"
