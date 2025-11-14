# Expo Updates Fix - Summary

## Issues Identified

### 1. ❌ CRITICAL: RuntimeVersion Mismatch
**Problem:** The `runtimeVersion` was being updated with every patch version (`1.0.79`, `1.0.80`, etc.), which breaks OTA updates.

**Why it's critical:** 
- OTA updates only work when the installed APK and the published update have the **exact same** `runtimeVersion`
- Users on version `1.0.79` cannot receive updates published with `runtimeVersion: 1.0.80`
- Every version bump created a new incompatible runtime version

**Solution:** Changed to a stable `runtimeVersion: "1.0.0"` that won't change unless native code changes.

---

### 2. ⚠️ Missing Update Channel Configuration
**Problem:** The `app.json` updates configuration didn't specify which branch/channel to check for updates.

**Why it matters:**
- The GitHub workflow publishes updates to the `production` branch
- Without proper configuration, the app might not check the correct branch

**Solution:** Added `"checkAutomatically": "ON_LOAD"` to ensure updates are checked when the app loads.

---

### 3. ⚠️ Update Check Only on Initial Launch
**Problem:** Updates were only checked once when the app first launched, not when the app came back to foreground.

**Why it matters:**
- Users might not get updates if they keep the app running in the background
- Updates should be checked when the app resumes from background

**Solution:** Added `AppState` listener to check for updates whenever the app becomes active.

---

## Changes Made

### 1. `app.json`
```json
{
  "runtimeVersion": "1.0.0",  // Changed from "1.0.79"
  "updates": {
    "enabled": true,
    "fallbackToCacheTimeout": 0,
    "checkAutomatically": "ON_LOAD",  // Added
    "url": "https://u.expo.dev/5e83bcd4-20b8-43a2-998d-934ca4c89ca1"
  }
}
```

### 2. `scripts/bump-version.js`
Commented out the line that updates `runtimeVersion` with every version bump:
```javascript
// Keep runtimeVersion stable for OTA updates to work
// Only change runtimeVersion when native code changes (breaking changes)
// appJson.expo.runtimeVersion = newVersion; // Commented out - keep at 1.0.0
```

### 3. `.github/workflows/android-build.yml`
Added runtime version logging to ensure consistency:
```yaml
- name: Publish OTA update to EAS
  run: |
    echo "Publishing OTA update with runtime version from app.json"
    RUNTIME_VERSION=$(node -p "require('./app.json').expo.runtimeVersion")
    echo "Runtime version: $RUNTIME_VERSION"
    npx --yes eas update --branch production --message "Auto OTA update from GitHub CI ($GITHUB_SHA)" --platform android --non-interactive
```

### 4. `src/main.jsx`
- Extracted update check logic into a separate function
- Added `AppState` listener to check for updates when app comes to foreground
- Improved user experience with "Later" option in update dialog

---

## Testing Steps

### 1. **Build a New APK with Runtime Version 1.0.0**
```bash
# On release branch
yarn release
```

This will:
- Bump the app version (e.g., to 1.0.80)
- Keep runtimeVersion at 1.0.0
- Trigger GitHub Actions to build APK and publish OTA update

### 2. **Install the APK on a Test Device**
- Download the APK from GitHub Release
- Install it on your device
- Open the app and verify it works

### 3. **Make a Code Change and Publish an Update**
```bash
# On master branch
git add .
git commit -m "test: update button text"
yarn release
```

This will:
- Build a new APK with the same runtimeVersion (1.0.0)
- Publish an OTA update to the production branch

### 4. **Verify Update is Received**
- Keep the test app open
- Put it in background (home button)
- Bring it back to foreground
- You should see "Checking for updates..." in logs
- If an update is available, you'll see the update dialog

### 5. **Check Logs**
```bash
# View logs on Android device
adb logcat | grep -i "update"
```

You should see:
```
Checking for updates...
Update available, fetching...
```

---

## Important Notes

### When to Change RuntimeVersion

**Only change `runtimeVersion` when:**
1. You update native dependencies (e.g., upgrade React Native version)
2. You change native code in `android/` or `ios/` folders
3. You add/remove native modules or Expo plugins
4. You change build configuration that affects native code

**How to change it:**
1. Manually update `runtimeVersion` in `app.json` (e.g., from "1.0.0" to "1.1.0")
2. Run `yarn release` to build new APK with new runtime version
3. Users on old runtime version will need to download new APK (cannot get OTA update)

### OTA Update Limitations

OTA updates can update:
- ✅ JavaScript code
- ✅ React components
- ✅ Assets (images, fonts)
- ✅ App logic and business rules

OTA updates CANNOT update:
- ❌ Native code (Java/Kotlin for Android)
- ❌ Native dependencies
- ❌ App permissions
- ❌ Build configuration

---

## Troubleshooting

### Update Not Showing Up

1. **Check runtime version matches:**
   ```bash
   # In your project
   node -p "require('./app.json').expo.runtimeVersion"
   ```

2. **Check EAS update was published:**
   ```bash
   npx eas update:list --branch production
   ```

3. **Check app is using correct update URL:**
   - Open app
   - Check logs for "Checking for updates..."
   - Verify no errors

4. **Force check for updates:**
   - Close app completely
   - Open app again
   - OR put app in background and bring to foreground

### Common Errors

**Error: "No published update found"**
- Make sure you published an update with `npx eas update`
- Check that the branch name matches ("production")

**Error: "Update is not compatible"**
- Runtime version mismatch
- Build a new APK with matching runtime version

**Update downloads but doesn't apply**
- Check that `Updates.reloadAsync()` is called
- Verify user clicked "Restart Now" in dialog

---

## Next Steps

1. ✅ Test the fixes by following the testing steps above
2. ✅ Monitor logs to ensure updates are being checked
3. ✅ Verify users receive updates without needing to reinstall APK
4. 📝 Document when to increment runtime version for your team
5. 📝 Set up monitoring/analytics to track update adoption rates

---

## Additional Resources

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Runtime Versions Guide](https://docs.expo.dev/eas-update/runtime-versions/)
- [EAS Update Best Practices](https://docs.expo.dev/eas-update/best-practices/)
