# Deployment Guide

## Overview

This project uses EAS Updates for over-the-air (OTA) updates and GitHub Actions for automated builds and deployments.

## Prerequisites

### Required GitHub Secrets

The following secrets must be configured in your GitHub repository at:
`https://github.com/iOSAS-CdM/mobile/settings/secrets/actions`

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `EXPO_TOKEN` | Authenticate with Expo for publishing OTA updates | ✅ Yes |
| `KEYSTORE_BASE64` | Base64-encoded Android keystore for signing APKs | ✅ Yes |
| `KEY_ALIAS` | Keystore key alias | ✅ Yes |
| `KEY_PASSWORD` | Key password for the keystore | ✅ Yes |
| `STORE_PASSWORD` | Keystore password | ✅ Yes |
| `GITHUB_TOKEN` | Create GitHub releases | ✅ Auto-provided |

### How to Get EXPO_TOKEN

1. Login to Expo CLI:
   ```bash
   npx eas-cli login
   ```

2. Create an access token at:
   https://expo.dev/accounts/iosas/settings/access-tokens

3. Add it to GitHub Secrets as `EXPO_TOKEN`

### How to Generate Android Keystore

If you don't have a keystore yet:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Then encode it to base64:
```bash
base64 -w 0 < my-release-key.keystore
```

## Deployment Workflow

### 1. Development

Work on the `master` (or feature) branch:
```bash
git checkout master
# Make your changes
git add .
git commit -m "Your changes"
git push origin master
```

### 2. Release Process

When ready to deploy to production:

```bash
# Use the automated release script
npm run release
# or manually:
# npm run version:bump
# git push origin release
```

This will:
1. Auto-bump the version number
2. Commit the version change
3. Push to the `release` branch
4. Trigger the GitHub Actions workflow

### 3. GitHub Actions Workflow

When code is pushed to the `release` branch, the workflow automatically:

1. ✅ Builds Android APK
2. ✅ Signs the APK (if keystore secrets are provided)
3. ✅ Publishes OTA update to EAS (production branch)
4. ✅ Creates a GitHub release with the APK
5. ✅ Uploads artifacts

Workflow file: `.github/workflows/android-build.yml`

## OTA Updates (Over-the-Air)

### How It Works

```
[User Opens App] 
    ↓
[Check for Updates] (only in production builds)
    ↓
[Download Update if Available]
    ↓
[Prompt User to Restart]
    ↓
[Apply Update and Reload]
```

### Update Configuration

- **Branch**: `production`
- **Runtime Version**: Synced with app version (e.g., `1.0.70`)
- **Updates URL**: `https://u.expo.dev/5e83bcd4-20b8-43a2-998d-934ca4c89ca1`

### Publishing Manual Updates

If you need to publish an OTA update without building a new APK:

```bash
# Publish to production branch
npx eas update --branch production --message "Fix critical bug"

# Publish to specific platform
npx eas update --branch production --platform android --message "Android-specific fix"
```

### When to Use OTA Updates

✅ **Use OTA for:**
- JavaScript/React code changes
- UI updates
- Bug fixes
- Configuration changes
- Asset updates (images, fonts)

❌ **Cannot use OTA for:**
- Native code changes (requires new build)
- Changing native dependencies
- Updating Expo SDK version
- Changing Android/iOS permissions
- Modifying native configuration

## Version Management

### Automatic Version Bumping

The project has a pre-commit hook that automatically bumps the version:

```bash
git commit -m "Your message"
# Version automatically bumped: 1.0.69 → 1.0.70
```

### Manual Version Bump

```bash
npm run version:bump
```

This updates:
- `package.json` version
- `app.json` version
- `app.json` runtimeVersion

### Runtime Version

The `runtimeVersion` in `app.json` must match the version of the app binary. When native code changes:

1. Bump the runtime version
2. Rebuild the APK
3. Users must install the new APK (OTA won't work across runtime versions)

## Testing

### Test OTA Updates Locally

1. Build a production APK:
   ```bash
   npx eas build --platform android --profile production --local
   ```

2. Install on a test device:
   ```bash
   adb install path/to/build.apk
   ```

3. Publish a test update:
   ```bash
   npx eas update --branch production --message "Test update"
   ```

4. Open the app and verify the update is fetched

### Test Development Builds

```bash
npm start
# or
npx expo start
```

Note: Update checks are disabled in development (`__DEV__` check)

## Monitoring

### View Updates

- Expo Dashboard: https://expo.dev/accounts/iosas/projects/iOSAS/updates
- GitHub Releases: https://github.com/iOSAS-CdM/mobile/releases

### View Build Status

- GitHub Actions: https://github.com/iOSAS-CdM/mobile/actions

## Troubleshooting

### Update Not Received by Users

1. **Check Runtime Version**: Ensure app binary and update have matching runtime versions
2. **Check Branch**: Verify production builds point to `production` branch
3. **Check Network**: OTA updates require internet connection
4. **Check Logs**: Look for errors in app console

### Build Fails in GitHub Actions

1. **Check Secrets**: Verify all required secrets are configured
2. **Check Keystore**: Ensure keystore is properly base64-encoded
3. **Check Node Version**: Workflow uses Node.js 20
4. **Check Dependencies**: Ensure `package-lock.json` is up to date

### EXPO_TOKEN Invalid

If you see authentication errors:

1. Generate a new token at: https://expo.dev/accounts/iosas/settings/access-tokens
2. Update the `EXPO_TOKEN` secret in GitHub
3. Re-run the workflow

## Best Practices

1. **Always test updates** on a test device before pushing to production
2. **Use semantic versioning** for version numbers (MAJOR.MINOR.PATCH)
3. **Write descriptive commit messages** for release notes
4. **Monitor update adoption** in the Expo dashboard
5. **Keep runtime version in sync** with native code changes
6. **Have a rollback plan** in case of critical bugs

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/iOSAS-CdM/mobile/issues)
- Refer to [Expo Updates Documentation](https://docs.expo.dev/eas-update/introduction/)
- Check the [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
