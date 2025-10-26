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
- For non-interactive builds you can configure credentials in the EAS dashboard or use `eas credentials` beforehand (interactive) to upload keys.
- You may also script uploading credentials via the EAS API or the CLI if needed (see EAS docs).

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

