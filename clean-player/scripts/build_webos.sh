#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_NAME="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
BUILD_DIR="$ROOT_DIR/build/webos"
APP_DIR="$BUILD_DIR/CleanPlayer"
DIST_DIR="$ROOT_DIR/dist"
OUT_IPK="$DIST_DIR/CleanPlayer-webos-$VERSION_NAME.ipk"
OUT_SOURCE="$DIST_DIR/CleanPlayer-webos-source-$VERSION_NAME.zip"
PNPM="${PNPM:-$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm}"
NODE_DIR="${NODE_DIR:-$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin}"

export PATH="$NODE_DIR:$PATH"

rm -rf "$BUILD_DIR"
mkdir -p "$APP_DIR" "$DIST_DIR"
cp "$ROOT_DIR/shared/"* "$APP_DIR/"
sed "s/@VERSION_NAME@/$VERSION_NAME/g" "$ROOT_DIR/webos/appinfo.json.in" > "$APP_DIR/appinfo.json"
cp "$ROOT_DIR/webos/icon.png" "$APP_DIR/icon.png"
cp "$ROOT_DIR/webos/largeIcon.png" "$APP_DIR/largeIcon.png"

rm -f "$OUT_IPK" "$OUT_SOURCE"
(cd "$APP_DIR/.." && zip -qr "$OUT_SOURCE" "$(basename "$APP_DIR")")

if command -v ares-package >/dev/null 2>&1; then
  ARES_PACKAGE="$(command -v ares-package)"
  "$ARES_PACKAGE" "$APP_DIR" -o "$DIST_DIR"
elif [[ -x "$PNPM" ]]; then
  "$PNPM" --package=@webos-tools/cli dlx ares-package "$APP_DIR" -o "$DIST_DIR"
else
  echo "ares-package not found; source package created: $OUT_SOURCE" >&2
  exit 2
fi

FOUND_IPK="$(find "$DIST_DIR" -maxdepth 1 -name '*.ipk' -print | sort | tail -n 1)"
if [[ -z "$FOUND_IPK" ]]; then
  echo "ares-package finished without an IPK output" >&2
  exit 3
fi
if [[ "$FOUND_IPK" != "$OUT_IPK" ]]; then
  mv "$FOUND_IPK" "$OUT_IPK"
fi

echo "$OUT_IPK"
