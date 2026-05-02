#!/usr/bin/env bash
# Purge Cloudflare cache for tadlockpsychiatry.com.
#
# Run as a Hosting postdeploy hook (firebase.json hosting.postdeploy)
# so every `firebase deploy --only hosting` (and the canonical
# `op-firebase-deploy` chain) clears the Cloudflare edge cache after
# publishing the new hosting version. Without this, Cloudflare keeps
# serving the prior version of HTML / CSS / JS for up to its
# Edge-cached TTL (matches the Cache-Control headers in firebase.json
# unless an Edge override is set), so visitors on the custom domain
# can see stale content for up to ~5 min after a deploy.
#
# Token + zone come from 1Password by default. The `All Domains —
# Cache Purge API token` is scoped to Cache Purge ONLY (zero blast
# radius if leaked) and works against any zone in the account, so
# we don't need a project-specific token.
#
# Usage:
#   scripts/cf-purge.sh                                  # purge everything
#   ZONE_ID=other DOMAIN=other.com scripts/cf-purge.sh   # override
#   DRY_RUN=1 scripts/cf-purge.sh                        # show what would purge
#   SKIP=1 scripts/cf-purge.sh                           # no-op (CI / tests)
#
# The exit code is the script's own assessment:
#   0 success, or skipped, or graceful no-op
#   1 hard failure (token unavailable, API error, missing prereqs)
#
# Designed to fail SOFT in the predeploy chain so a temporary
# Cloudflare API hiccup doesn't block a hosting deploy that already
# succeeded. Set CF_PURGE_FAIL_HARD=1 to flip that.
set -euo pipefail

if [[ "${SKIP:-}" == "1" ]]; then
  echo "[cf-purge] SKIP=1, no-op"
  exit 0
fi

# Defaults — override via env if you fork or rename.
ZONE_ID="${ZONE_ID:-b4a043e316d4c2b76af6fff655c0f4a6}"
DOMAIN="${DOMAIN:-tadlockpsychiatry.com}"
TOKEN_OP_PATH="${CF_TOKEN_OP_PATH:-op://Private/4x6wslp3f6pal5t6h3jhhe63ie/credential}"
FAIL_HARD="${CF_PURGE_FAIL_HARD:-0}"

soft_fail() {
  local msg="$1"
  if [[ "$FAIL_HARD" == "1" ]]; then
    echo "[cf-purge] FAIL: $msg" >&2
    exit 1
  fi
  echo "[cf-purge] WARN (soft-failing): $msg" >&2
  exit 0
}

# Token resolution. Prefer the explicit env var so CI can set it
# directly; fall back to op read if not provided.
if [[ -n "${CF_API_TOKEN:-}" ]]; then
  TOKEN="$CF_API_TOKEN"
else
  if ! command -v op >/dev/null 2>&1; then
    soft_fail "1Password CLI (op) not on PATH and CF_API_TOKEN not set"
  fi
  TOKEN="$(op read "$TOKEN_OP_PATH" 2>/dev/null || true)"
  if [[ -z "$TOKEN" ]]; then
    soft_fail "could not read $TOKEN_OP_PATH from 1Password"
  fi
fi

if [[ "${DRY_RUN:-}" == "1" ]]; then
  echo "[cf-purge] DRY_RUN=1: would POST purge_cache to zone $ZONE_ID ($DOMAIN)"
  exit 0
fi

echo "[cf-purge] purging Cloudflare cache for $DOMAIN (zone $ZONE_ID)"

# Cloudflare's purge endpoint returns 200 + JSON {success:true,...} on
# OK. We grab the HTTP status separately so transport errors are
# distinguishable from API rejections.
RESP_BODY="$(mktemp -t cf-purge-resp.XXXXXX)"
HTTP_CODE="$(curl -sS \
  --connect-timeout 5 --max-time 30 \
  -o "$RESP_BODY" -w '%{http_code}' \
  -X POST \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' || echo "000")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "[cf-purge] API returned HTTP $HTTP_CODE" >&2
  cat "$RESP_BODY" >&2 || true
  rm -f "$RESP_BODY"
  soft_fail "purge_cache HTTP $HTTP_CODE"
fi

# Confirm success in the JSON body too — Cloudflare can return 200
# with success:false on certain error classes.
SUCCESS="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("success", False))' <"$RESP_BODY" 2>/dev/null || echo False)"
rm -f "$RESP_BODY"

if [[ "$SUCCESS" != "True" ]]; then
  soft_fail "API returned success=false"
fi

echo "[cf-purge] OK"
