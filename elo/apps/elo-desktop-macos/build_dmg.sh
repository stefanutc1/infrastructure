#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/EloDesktop"
BUILD_DIR="$SCRIPT_DIR/build"
DIST_DIR="$SCRIPT_DIR/dist"
APP_NAME="ELO"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
DMG_NAME="ELO-macOS-arm64.dmg"
STAGING_DIR="$BUILD_DIR/dmg_staging"

echo "Building ELO .NET 10 macOS Application & DMG Installer..."

rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR" "$STAGING_DIR"

dotnet publish "$PROJECT_DIR/EloDesktop.csproj" \
    -c Release \
    -r osx-arm64 \
    --self-contained \
    -p:PublishSingleFile=false \
    -o "$BUILD_DIR/publish"

mkdir -p "$APP_BUNDLE/Contents/MacOS"
mkdir -p "$APP_BUNDLE/Contents/Resources"

cp -R "$BUILD_DIR/publish/"* "$APP_BUNDLE/Contents/MacOS/"
chmod +x "$APP_BUNDLE/Contents/MacOS/$APP_NAME"

if [ -f "$SCRIPT_DIR/AppIcon.icns" ]; then
    cp "$SCRIPT_DIR/AppIcon.icns" "$APP_BUNDLE/Contents/Resources/AppIcon.icns"
fi

cat << 'EOF' > "$APP_BUNDLE/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>ELO</string>
    <key>CFBundleDisplayName</key>
    <string>ELO</string>
    <key>CFBundleIdentifier</key>
    <string>com.elo.operatinglayer</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleExecutable</key>
    <string>ELO</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>Microphone access is required for voice control.</string>
    <key>NSSpeechRecognitionUsageDescription</key>
    <string>Speech recognition access is required for voice transcription.</string>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
</plist>
EOF

cp -R "$APP_BUNDLE" "$STAGING_DIR/"
ln -s /Applications "$STAGING_DIR/Applications"

hdiutil create \
    -volname "ELO" \
    -srcfolder "$STAGING_DIR" \
    -ov \
    -format UDZO \
    "$DIST_DIR/$DMG_NAME"

echo "DMG created at: $DIST_DIR/$DMG_NAME"
ls -lh "$DIST_DIR/$DMG_NAME"
