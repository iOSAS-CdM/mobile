# Release Command - Quick Reference

## Trigger a Release Build

```bash
yarn release
```

This bash script automates the entire release process using your existing Git authentication!

## What It Does

1. **Checks Status** - Verifies no uncommitted changes (offers to commit if needed)
2. **Shows Version** - Displays current version from `package.json`
3. **Confirms** - Asks for confirmation before proceeding
4. **Pushes Current Branch** - Ensures your work is backed up
5. **Switches to Release** - Checks out the `release` branch
6. **Merges** - Merges `master` into `release`
7. **Triggers Build** - Pushes to trigger GitHub Actions
8. **Returns** - Switches back to your original branch
9. **Shows Links** - Provides direct links to monitor build

## Example Output

```
🚀 Release Trigger Script

📍 Current branch: master
📦 Current version: 1.0.6

🔔 Ready to trigger release build v1.0.6? (y/n): y

⬆️  Pushing master to remote...
🔀 Switching to release branch...
⬇️  Pulling latest release...
🔀 Merging master into release...
🚀 Pushing release branch to trigger build...
🔙 Switching back to master...

✅ Release triggered successfully!

📊 Monitor the build at:
   https://github.com/iOSAS-CdM/mobile/actions

📦 Release will be available at:
   https://github.com/iOSAS-CdM/mobile/releases

🏷️  Version: v1.0.6
```

## Interactive Features

### Uncommitted Changes

If you have uncommitted changes, the script will ask:

```
⚠️  You have uncommitted changes:
M src/components/Button.jsx

Do you want to commit them now? (y/n):
```

- Answer **yes** - Script will prompt for commit message and commit
- Answer **no** - Script exits, asking you to commit manually

### Confirmation

Before triggering the release:

```
🔔 Ready to trigger release build v1.0.6? (y/n):
```

- Answer **yes** - Proceeds with release
- Answer **no** - Cancels the release

## Authentication

The bash script uses your **existing Git authentication**, so:

- ✅ **SSH keys**: Works automatically if you have SSH keys set up
- ✅ **Credential helper**: Uses stored credentials if configured
- ✅ **GitHub CLI**: Works with `gh auth login`
- ✅ **Git credential manager**: Uses any system credential manager
- ✅ **No PAT needed**: Unlike the Node.js version, no Personal Access Token required!

If push fails, the script suggests authentication options.

## Error Handling

The script handles errors gracefully:

- **Merge conflicts** - Returns you to original branch
- **Network errors** - Shows error and restores state
- **Git errors** - Displays helpful error messages

## When to Use

Use `yarn release` when you want to:

- ✅ Create a production build
- ✅ Deploy to Google Play Store
- ✅ Share APK with testers
- ✅ Create a new release on GitHub

## Alternative: Manual Release

If you prefer manual control:

```bash
git checkout master
git push origin master
git checkout release
git merge master
git push origin release
git checkout master
```

But why do that when `yarn release` does it all for you? 😊

## Monitoring the Build

After triggering:

1. **GitHub Actions**: https://github.com/iOSAS-CdM/mobile/actions
2. **Releases**: https://github.com/iOSAS-CdM/mobile/releases
3. Build typically completes in 5-10 minutes

## Download Your Build

Once complete:

1. Go to Releases page
2. Find the latest release (e.g., `v1.0.6-123`)
3. Download:
   - `app-release.apk` - For testing
   - `app-release.aab` - For Play Store

## Tips

- Always work on `master` branch
- Let `yarn release` handle branch switching
- Version bumps automatically on commit
- Each release has a unique version tag

---

**Need help?** Check `GITHUB_ACTIONS_BUILD.md` for detailed documentation.
