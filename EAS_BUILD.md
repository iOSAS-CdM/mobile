EAS build instructions for iOSAS

This file explains how to build an Android APK/AAB for this project using EAS Build.

Summary of repository changes
- `android/app/build.gradle` was updated to add a `release` signingConfig that:
  - Reads `keystore.properties` (not checked in) if present, or project properties such as
    `MYAPP_RELEASE_STORE_FILE`, `MYAPP_RELEASE_STORE_PASSWORD`, `MYAPP_RELEASE_KEY_ALIAS`,
    `MYAPP_RELEASE_KEY_PASSWORD` (or synonyms `RELEASE_*`).
  - Falls back to the existing debug keystore when no release keystore is provided (so
    local development and local debug/release builds continue to work).

Prerequisites
- Node.js and project dependencies installed (use `npm install` or `yarn`).
- EAS CLI: install with `npm install -g eas-cli` or use `npx eas`.
- An Expo/EAS account and the project linked to EAS. This project already contains an `extra.eas.projectId` in `app.json`.

Basic EAS build commands
- Log in:
  - `eas login` (or `npx eas login`)
- Validate project link (optional):
  - `eas whoami` to check account
  - `eas project:init` or open the EAS dashboard to verify projectId matches
- Build an APK (internal/preview profile):
  - `eas build -p android --profile preview`
  - This uses the `preview` profile from `eas.json`, which is configured to produce an APK.
- Build a production AAB (bundle for Play Store):
  - `eas build -p android --profile production`

Credentials (keystore)
- EAS can manage Android credentials for you. When you run `eas build` the first time, it will ask whether
  you want EAS to manage the keystore or whether you want to provide your own.
- To upload a keystore yourself:
  1. Generate (example):
     - `keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`
  2. Use the EAS interactive credentials flow: `eas credentials -p android` and pick the upload option, or use the web dashboard.
- If you prefer to provide a `keystore.properties` file for local builds, create `android/keystore.properties` (DO NOT commit it) with the following keys:
  - storeFile=path/to/my-release-key.keystore
  - storePassword=yourStorePassword
  - keyAlias=my-key-alias
  - keyPassword=yourKeyPassword

Notes about the Gradle change
- `android/app/build.gradle` now looks for `keystore.properties` or project properties before falling back to the debug keystore.
- EAS-managed builds will provide a proper release keystore at build time (the interactive flow or dashboard will store credentials on the EAS servers).
- For Play Store uploads use the `production` profile (AAB). For internal testing you can use the `preview` profile which builds an APK.

CI / Non-interactive builds
- This project now includes a GitHub Actions workflow (`.github/workflows/eas-build.yml`) that automatically triggers EAS builds when you push to the `release` branch.
- For non-interactive builds you can configure credentials in the EAS dashboard or use `eas credentials` beforehand (interactive) to upload keys.
- You may also script uploading credentials via the EAS API or the CLI if needed (see EAS docs).

## GitHub Actions Setup

This repository is configured to automatically build your app using EAS when you push to the `release` branch.

### Required GitHub Secret

You must add an `EXPO_TOKEN` secret to your GitHub repository:

1. **Generate an Expo Access Token**:
   - Log in to your Expo account at https://expo.dev
   - Go to Access Tokens: https://expo.dev/accounts/[your-username]/settings/access-tokens
   - Click "Create Token"
   - Give it a descriptive name (e.g., "GitHub Actions")
   - Copy the generated token (you won't be able to see it again!)

2. **Add the token to GitHub Secrets**:
   - Go to your GitHub repository: https://github.com/iOSAS-CdM/mobile
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: Paste the token you copied from Expo
   - Click "Add secret"

### How the Workflow Works

The workflow in `.github/workflows/eas-build.yml`:
- Triggers automatically on every push to the `release` branch
- Checks out your code
- Sets up Node.js and Yarn
- Installs dependencies using Yarn
- Authenticates with EAS using your `EXPO_TOKEN`
- Builds both:
  - An APK (preview profile) for internal testing
  - An AAB (production profile) for Play Store uploads

### Using the Release Branch

1. **Make changes on master/main**:
   ```bash
   git checkout master
   # Make your changes, commit them
   git add .
   git commit -m "Your changes"
   git push origin master
   ```

2. **Merge to release to trigger a build**:
   ```bash
   git checkout release
   git merge master
   git push origin release
   ```

3. **Monitor the build**:
   - Go to the "Actions" tab in your GitHub repository
   - Click on the running workflow to see progress
   - Or check the EAS dashboard: https://expo.dev/accounts/[your-username]/projects/iOSAS/builds

### Build Artifacts

After the build completes:
- Go to the EAS dashboard to download your APK/AAB
- Or use `eas build:list` to see recent builds
- Share the APK link directly for internal testing

### Customizing the Workflow

To modify the workflow behavior, edit `.github/workflows/eas-build.yml`:
- Change the trigger branch by editing the `branches` list
- Add iOS builds by duplicating the build step with `--platform ios`
- Add environment variables or build-time configuration
- Customize build profiles by editing `eas.json`

Troubleshooting
- If Gradle complains about missing keystore values locally, either create `android/keystore.properties` or let the code fall back to `debug.keystore` (this is the default behavior).
- If you see mismatched applicationId / package names, confirm `app.json` -> `android.package` and `android/app/build.gradle` namespace/applicationId match (they do in this repo: `com.anonymous.iOSAS`).

Next steps
- Run `eas build -p android --profile preview` and follow prompts to let EAS manage or upload a keystore.
- If you want me to, I can also:
  - Walk through uploading a keystore and performing the first EAS build interactively.
  - Prepare a CI workflow for automatic EAS builds (GitHub Actions) and show how to store credentials.

References
- EAS Build docs: https://docs.expo.dev/build/introduction/
- Managing credentials: https://docs.expo.dev/accounts/credentials/

