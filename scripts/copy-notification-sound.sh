#!/bin/bash

# Script to copy notification sound to iOS app bundle
# This is run during the build process

SOURCE_SOUND="scripts/notification.wav"
DEST_SOUND="ios/App/App/notification.wav"

if [ -f "$SOURCE_SOUND" ]; then
    mkdir -p "$(dirname "$DEST_SOUND")"
    cp "$SOURCE_SOUND" "$DEST_SOUND"
    echo "✅ Notification sound copied to iOS bundle"
else
    echo "⚠️  Source sound file not found: $SOURCE_SOUND"
    exit 1
fi
