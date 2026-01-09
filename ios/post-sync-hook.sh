#!/bin/bash

# Post-build script for Capacitor iOS to copy notification sound
# This script is run by cap sync to ensure the notification sound is in the app bundle

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "📱 Capacitor Post-Sync Hook: Copying Notification Sound"
echo "Project root: $PROJECT_ROOT"

# Path to source sound file
SOURCE_SOUND="$PROJECT_ROOT/scripts/notification.wav"

# Path to iOS app bundle
IOS_BUNDLE="$PROJECT_ROOT/ios/App/App"

# Copy the sound file
if [ -f "$SOURCE_SOUND" ]; then
    cp "$SOURCE_SOUND" "$IOS_BUNDLE/notification.wav"
    echo "✅ Copied notification.wav to iOS app bundle"
    
    # List the copied file
    if [ -f "$IOS_BUNDLE/notification.wav" ]; then
        SIZE=$(stat -f%z "$IOS_BUNDLE/notification.wav" 2>/dev/null || stat -c%s "$IOS_BUNDLE/notification.wav")
        echo "✅ Sound file verified: $SIZE bytes"
    fi
else
    echo "⚠️  Source sound file not found: $SOURCE_SOUND"
    echo "⚠️  Generating notification sound..."
    
    # Generate the sound if it doesn't exist
    cd "$PROJECT_ROOT"
    python3 scripts/generate-notification-sound.py
    
    # Try copying again
    if [ -f "$SOURCE_SOUND" ]; then
        cp "$SOURCE_SOUND" "$IOS_BUNDLE/notification.wav"
        echo "✅ Generated and copied notification.wav to iOS app bundle"
    else
        echo "❌ Failed to generate notification sound"
        exit 1
    fi
fi

exit 0
