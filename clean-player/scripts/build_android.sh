#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_NAME="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
IFS=. read -r VERSION_MAJOR VERSION_MINOR VERSION_PATCH <<< "$VERSION_NAME"
VERSION_CODE=$((10#$VERSION_MAJOR * 10000 + 10#$VERSION_MINOR * 100 + 10#$VERSION_PATCH))

ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BUILD_TOOLS="${BUILD_TOOLS:-$ANDROID_HOME/build-tools/36.1.0}"
ANDROID_JAR="${ANDROID_JAR:-$ANDROID_HOME/platforms/android-36.1/android.jar}"
JDK_HOME="${JDK_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

AAPT="${AAPT:-$BUILD_TOOLS/aapt}"
D8="${D8:-$BUILD_TOOLS/d8}"
ZIPALIGN="${ZIPALIGN:-$BUILD_TOOLS/zipalign}"
APKSIGNER="${APKSIGNER:-$BUILD_TOOLS/apksigner}"
JAVAC="${JAVAC:-$JDK_HOME/bin/javac}"
JAR="${JAR:-$JDK_HOME/bin/jar}"
KEYTOOL="${KEYTOOL:-$JDK_HOME/bin/keytool}"

export JAVA_HOME="$JDK_HOME"
export PATH="$JDK_HOME/bin:$PATH"

BUILD_DIR="$ROOT_DIR/build/android"
DIST_DIR="$ROOT_DIR/dist"
ASSET_DIR="$BUILD_DIR/assets"
GEN_DIR="$BUILD_DIR/gen"
CLASS_DIR="$BUILD_DIR/classes"
DEX_DIR="$BUILD_DIR/dex"
KEYSTORE="$BUILD_DIR/debug.keystore"
APK_UNSIGNED="$BUILD_DIR/CleanPlayer-unsigned.apk"
APK_ALIGNED="$BUILD_DIR/CleanPlayer-aligned.apk"
APK_OUT="$DIST_DIR/CleanPlayer-android-$VERSION_NAME.apk"

rm -rf "$BUILD_DIR"
mkdir -p "$ASSET_DIR" "$GEN_DIR" "$CLASS_DIR" "$DEX_DIR" "$DIST_DIR"
rm -f "$APK_OUT" "$APK_OUT.idsig"
cp "$ROOT_DIR/shared/"* "$ASSET_DIR/"

sed \
  -e "s/@VERSION_NAME@/$VERSION_NAME/g" \
  -e "s/@VERSION_CODE@/$VERSION_CODE/g" \
  "$ROOT_DIR/android/AndroidManifest.xml.in" > "$BUILD_DIR/AndroidManifest.xml"

if [[ ! -f "$KEYSTORE" ]]; then
  "$KEYTOOL" -genkeypair \
    -keystore "$KEYSTORE" \
    -storetype PKCS12 \
    -storepass cleanplayer \
    -keypass cleanplayer \
    -alias cleanplayer \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Clean Player Debug,O=Shardice,C=US"
fi

"$AAPT" package \
  -f \
  -m \
  -J "$GEN_DIR" \
  -M "$BUILD_DIR/AndroidManifest.xml" \
  -S "$ROOT_DIR/android/res" \
  -I "$ANDROID_JAR" \
  -A "$ASSET_DIR" \
  -F "$APK_UNSIGNED"

SOURCE_LIST="$BUILD_DIR/java-sources.list"
find "$ROOT_DIR/android/src" "$GEN_DIR" -name '*.java' | sort > "$SOURCE_LIST"
"$JAVAC" --release 8 -encoding UTF-8 -classpath "$ANDROID_JAR" -d "$CLASS_DIR" @"$SOURCE_LIST"

CLASSES_JAR="$BUILD_DIR/classes.jar"
(cd "$CLASS_DIR" && "$JAR" cf "$CLASSES_JAR" .)

"$D8" \
  --min-api 23 \
  --lib "$ANDROID_JAR" \
  --output "$DEX_DIR" \
  "$CLASSES_JAR"

(cd "$DEX_DIR" && zip -q "$APK_UNSIGNED" classes.dex)
"$ZIPALIGN" -f -p 4 "$APK_UNSIGNED" "$APK_ALIGNED"
"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias cleanplayer \
  --ks-pass pass:cleanplayer \
  --key-pass pass:cleanplayer \
  --v4-signing-enabled false \
  --out "$APK_OUT" \
  "$APK_ALIGNED"
"$APKSIGNER" verify "$APK_OUT"

echo "$APK_OUT"
