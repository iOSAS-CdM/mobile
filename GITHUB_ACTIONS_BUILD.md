# GitHub Actions Build Guide for iOSAS

This project is configured to automatically build Android APK and AAB files using **GitHub Actions** whenever you push to the `release` branch. The build happens entirely within GitHub's infrastructure - no external build service required.

## Overview

- **Build Trigger**: Automatically on push to `release` branch
- **Build Location**: GitHub Actions (free for public repos)
- **Build Time**: ~5-10 minutes
- **Outputs**: APK (for testing) + AAB (for Play Store)
- **Auto Release**: Creates a GitHub Release with downloadable APK/AAB
- **Cost**: Free (uses GitHub Actions minutes)

## How It Works

### The Workflow (`.github/workflows/build.yaml`)

1. **Triggers** on push to `release` branch or manual dispatch
2. **Sets up environment**:
   - Node.js 18 with Yarn
   - Java JDK 17 for Android builds
   - Gradle caching for faster builds
3. **Installs dependencies** using `yarn install --frozen-lockfile`
4. **Runs Expo Prebuild** to generate native Android project
5. **Builds**:
   - APK (release) - for direct installation on devices
   - AAB (release bundle) - for Google Play Store uploads
6. **Uploads artifacts** to GitHub (available for 30 days)
7. **Creates a GitHub Release** with:
   - Version tag from `package.json` (e.g., `v1.0.0-123`)
   - Release notes with commit information
   - APK and AAB files attached as downloadable assets
   - Automatic installation instructions

### No Secrets Required (for basic builds)

The workflow uses the debug keystore by default, so you can start building immediately without any configuration. For production releases, you can optionally configure a proper release keystore (see below).

## Usage

### Quick Release (Recommended)

Use the built-in release command to trigger a build with one command:

```bash
# Make your changes and commit them
git add .
git commit -m "feat: Add new feature"

# Trigger release build
yarn release
```

The script will:
1. ✅ Check for uncommitted changes
2. ✅ Push your current branch
3. ✅ Switch to release branch
4. ✅ Merge master into release
5. ✅ Push release to trigger build
6. ✅ Switch back to your original branch
7. ✅ Show build monitoring links

### Manual Release (Alternative)

Or trigger manually with Git commands:

```bash
# 1. Develop on Master Branch
git checkout master
# Make your changes
git add .
git commit -m "feat: Add new feature"
git push origin master

# 2. Trigger Build by Pushing to Release
git checkout release
git merge master
git push origin release
```

The GitHub Actions workflow will automatically start building.

### Monitor Build Progress

1. Go to your repository on GitHub: https://github.com/iOSAS-CdM/mobile
2. Click the **Actions** tab
3. Click on the running workflow
4. Watch real-time logs as it builds

Or if you used `yarn release`, the script will show you the direct links!

### Download Your Build

After the build completes successfully, you have **two ways** to download:

#### Option A: From GitHub Releases (Recommended)

1. Go to your repository: https://github.com/iOSAS-CdM/mobile
2. Click the **Releases** section (right sidebar)
3. Click on the latest release (e.g., `v1.0.0-123`)
4. Scroll down to **Assets**
5. Download:
   - `app-release.apk` - For testing on devices
   - `app-release.aab` - For uploading to Google Play Store

**Releases are permanent** - they don't expire like artifacts!

#### Option B: From Actions Artifacts (30-day limit)

1. Go to the **Actions** tab
2. Click on the completed workflow run
3. Scroll down to the **Artifacts** section
4. Download:
   - **android-apk** - For testing on devices
   - **android-aab** - For uploading to Google Play Store
5. Note: Artifacts expire after 30 days

### Install and Test

**For APK (Testing)**:
- Transfer the APK to your Android device
- Enable "Install from Unknown Sources" in device settings
- Open and install the APK
- Test your app!

**For AAB (Play Store)**:
- Go to Google Play Console
- Upload the AAB to a release track
- Follow Google's release process

## Available Commands

- **`yarn release`** - Trigger a release build (automatic merge and push)
- **`yarn start`** - Start Metro bundler for development
- **`yarn android`** - Run on Android device/emulator
- **`yarn ios`** - Run on iOS device/simulator
- **`yarn web`** - Run in web browser
- **`yarn version:bump`** - Manually bump version (usually automatic)

## Version Management

The workflow automatically creates releases using the version from `package.json` combined with the build number.

### Release Tag Format

- **Tag**: `v{version}-{build_number}`
  - Example: `v1.0.0-123` (version 1.0.0, build 123)
- **Name**: `Release v{version} (Build {build_number})`
  - Example: `Release v1.0.0 (Build 123)`

### Updating Version

To release a new version, update the version in `package.json`:

```bash
# Edit package.json and change "version": "1.0.0" to "1.0.1"
git checkout master
# Update version manually or use npm
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0

git push origin master

# Merge to release to build
git checkout release
git merge master
git push origin release
```

### Release Notes

Each release automatically includes:
- **Version and build number**
- **Build date and time**
- **Latest commit message and author**
- **Download links** for APK and AAB
- **Installation instructions**

You can customize release notes by editing the `.github/workflows/build.yaml` file.

### Finding Your Releases

All releases are available at:
- Direct link: https://github.com/iOSAS-CdM/mobile/releases
- Or click **Releases** in the right sidebar of your repository

## Configuring Release Keystore (Recommended for Production)

For production releases to Google Play, you should sign with a proper release keystore.

### Step 1: Generate a Keystore (One Time)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=iOSAS, OU=Mobile, O=iOSAS-CdM, L=City, ST=State, C=US"
```

**Save this keystore file securely!** You'll need it for all future releases.

### Step 2: Encode Keystore as Base64

```bash
base64 -i my-release-key.keystore -o keystore-base64.txt
# On macOS: base64 -i my-release-key.keystore -o keystore-base64.txt
# On Linux: base64 -w 0 my-release-key.keystore > keystore-base64.txt
```

### Step 3: Add GitHub Secrets

1. Go to: https://github.com/iOSAS-CdM/mobile/settings/secrets/actions
2. Click **New repository secret**
3. Add these four secrets:

| Secret Name         | Value                                   |
| ------------------- | --------------------------------------- |
| `KEYSTORE_BASE64`   | Contents of `keystore-base64.txt`       |
| `KEYSTORE_PASSWORD` | Password you set when creating keystore |
| `KEY_ALIAS`         | `my-key-alias` (or whatever you used)   |
| `KEY_PASSWORD`      | Key password you set                    |

### Step 4: Update Workflow to Use Release Keystore

Add this step to `.github/workflows/build.yaml` before the build steps:

```yaml
      - name: 🔑 Decode and Setup Release Keystore
        if: github.ref == 'refs/heads/release'
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/my-release-key.keystore
          echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore" >> $GITHUB_ENV
          echo "MYAPP_RELEASE_STORE_PASSWORD=${{ secrets.KEYSTORE_PASSWORD }}" >> $GITHUB_ENV
          echo "MYAPP_RELEASE_KEY_ALIAS=${{ secrets.KEY_ALIAS }}" >> $GITHUB_ENV
          echo "MYAPP_RELEASE_KEY_PASSWORD=${{ secrets.KEY_PASSWORD }}" >> $GITHUB_ENV
```

The Gradle build will automatically pick up these environment variables (they're already configured in `android/app/build.gradle`).

## Workflow Customization

### Build on Different Branches

Edit `.github/workflows/build.yaml`:

```yaml
on:
  push:
    branches:
      - release
      - main  # Add more branches
```

### Build Only APK or Only AAB

Remove the step you don't need from the workflow file.

### Add Automated Testing

Add this step before building:

```yaml
      - name: 🧪 Run Tests
        run: yarn test
```

### Build for Multiple Architectures

Edit the Gradle command:

```yaml
      - name: 🏗️ Build Android APK (Release)
        run: |
          cd android
          ./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
```

## Troubleshooting

### Build Fails with "Gradle Daemon"

The workflow uses `--no-daemon` to prevent daemon issues. If you still see problems, check the full logs in the Actions tab.

### Build Fails with "Out of Memory"

Add this to `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Dependencies Not Installing

The workflow uses `yarn install --frozen-lockfile`. Make sure your `yarn.lock` is committed and up to date:

```bash
yarn install
git add yarn.lock
git commit -m "chore: Update yarn.lock"
```

### APK Won't Install on Device

- Make sure you enabled "Install from Unknown Sources"
- Check that the APK is for the correct architecture (arm64-v8a for modern devices)
- Try uninstalling any existing version first

## Advantages vs EAS Build

| Feature              | GitHub Actions             | EAS Build                                 |
| -------------------- | -------------------------- | ----------------------------------------- |
| **Cost**             | Free (public repos)        | Requires subscription for frequent builds |
| **Build Time**       | 5-10 minutes               | 10-20 minutes (queue + build)             |
| **Transparency**     | Full logs in GitHub        | Logs in EAS dashboard                     |
| **Customization**    | Full control over workflow | Limited to EAS options                    |
| **Artifact Storage** | 30 days in GitHub          | Download from EAS dashboard               |
| **Setup**            | Configure workflow once    | Requires EXPO_TOKEN and credentials       |

## Optional: Using EAS for Updates Only

You can still use EAS for **over-the-air updates** without using it for builds:

```bash
# Publish an update
eas update --branch production --message "Bug fixes"
```

Your GitHub Actions-built APK/AAB can still receive OTA updates from EAS Update service.

## Summary

✅ Push to `release` branch → Automatic build in GitHub Actions
✅ Download APK/AAB from Actions artifacts
✅ No external build service required
✅ Free and fast
✅ Full control over the build process

For questions or issues, check the Actions logs or open an issue in the repository.
