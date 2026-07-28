#!/usr/bin/env bash
set -e

echo "====================================================="
echo "🚀 Starting Appium Mobile E2E CI Runner for SkillSync"
echo "====================================================="

# Inject Node PATH if running in CI environment
if [ -n "$GITHUB_PATH" ]; then
  export PATH="$GITHUB_PATH:$PATH"
fi

APK_PATH="${APK_PATH:-../frontend/android/app/build/outputs/apk/debug/app-debug.apk}"

if [ -f "$APK_PATH" ]; then
  echo "📱 Installing APK onto emulator: ${APK_PATH}"
  adb install -r "${APK_PATH}" || echo "Warning: adb install returned code $?"
else
  echo "⚠️ APK file not found at ${APK_PATH}, proceeding with test suite execution..."
fi

echo "🔄 Starting Appium server in background on port 4723..."
npx appium --log-level warn > /tmp/appium.log 2>&1 &
APPIUM_PID=$!

echo "⏳ Waiting for Appium server to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:4723/status > /dev/null; then
    echo "✅ Appium server is live on port 4723!"
    break
  fi
  sleep 1
done

echo "🏃 Executing 1,111 Parameterized Mobile E2E Test Suite..."
node scripts/run_appium_tests.js

echo "🧹 Cleaning up Appium server process..."
kill $APPIUM_PID 2>/dev/null || true

echo "✅ Appium E2E CI Execution Completed Successfully!"
