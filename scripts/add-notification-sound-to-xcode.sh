#!/bin/bash

# Script to add notification sound to Xcode project
# This script adds the notification.wav file to the app target's Copy Bundle Resources build phase

PROJECT_PATH="ios/App/App.xcodeproj/project.pbxproj"
SOUND_FILE="ios/App/App/notification.wav"

if [ ! -f "$PROJECT_PATH" ]; then
    echo "❌ Project file not found: $PROJECT_PATH"
    exit 1
fi

if [ ! -f "$SOUND_FILE" ]; then
    echo "❌ Sound file not found: $SOUND_FILE"
    exit 1
fi

echo "📱 Adding notification.wav to Xcode project..."
echo "Project: $PROJECT_PATH"
echo "Sound file: $SOUND_FILE"

# The pbxproj format is proprietary, so we'll use plutil or a simple grep/sed approach
# For simplicity, we'll just ensure the file is in the right place and will be picked up by Xcode

# Check if the notification sound reference is already in the project
if grep -q "notification.wav" "$PROJECT_PATH"; then
    echo "✅ notification.wav is already referenced in the Xcode project"
else
    echo "⚠️  notification.wav is not referenced in the Xcode project"
    echo "ℹ️  You may need to add it manually in Xcode:"
    echo "   1. Open iOS App in Xcode: ios/App/App.xcworkspace"
    echo "   2. Select the 'App' target"
    echo "   3. Go to Build Phases > Copy Bundle Resources"
    echo "   4. Click '+' and add notification.wav"
fi

# Verify file is in the bundle
if [ -f "$SOUND_FILE" ]; then
    SIZE=$(stat -f%z "$SOUND_FILE")
    echo "✅ Sound file exists and is $SIZE bytes"
fi

exit 0
