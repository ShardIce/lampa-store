#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "External URL literals:"
rg -n -o 'https?://[^"'\'' <>)`]+' "$ROOT_DIR/shared" "$ROOT_DIR/android" "$ROOT_DIR/webos" "$ROOT_DIR/scripts" || true

echo
echo "Network-capable API references:"
rg -n 'fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|src =|\.src =|INTERNET|usesCleartextTraffic|allowUrl|shouldInterceptRequest' "$ROOT_DIR/shared" "$ROOT_DIR/android" "$ROOT_DIR/webos" || true

echo
echo "Ad/analytics SDK markers:"
if rg -n -i 'doubleclick|googletagmanager|google-analytics|appsflyer|crashlytics|firebase|facebook\.com|adservice|adsystem|yandex|metrica' "$ROOT_DIR/shared" "$ROOT_DIR/android" "$ROOT_DIR/webos"; then
  echo "Unexpected ad or analytics marker found." >&2
  exit 1
fi
echo "None found."
