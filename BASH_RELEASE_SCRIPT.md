# Release Script - Bash Version

## Why Bash Instead of Node.js?

The release script has been rewritten in **bash** for simpler authentication:

| Feature | Bash Script | Node.js Script |
|---------|-------------|----------------|
| Authentication | Uses system Git auth | Needs PAT/credentials |
| Setup Required | None (if Git works) | Personal Access Token |
| SSH Keys | ✅ Automatic | ❌ Requires extra config |
| Credential Helper | ✅ Automatic | ❌ Manual setup |
| GitHub CLI | ✅ Works out of box | ❌ Extra configuration |

**Result**: If you can `git push` manually, `yarn release` will work!

## Usage

```bash
yarn release
```

## What You Need

Just working Git authentication. Any of these work:

### Option 1: SSH Keys (Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys

# Test
ssh -T git@github.com
```

### Option 2: GitHub CLI (Easiest)

```bash
# Install
sudo pacman -S github-cli  # Arch
sudo apt install gh        # Ubuntu

# Login
gh auth login

# Done!
```

### Option 3: Credential Helper (Simple)

```bash
# Store credentials after first use
git config --global credential.helper store

# Next push will ask once, then remember
git push mobile master
```

## Test Authentication

```bash
# Try a simple push
git push mobile master

# If this works, yarn release will work!
```

## Script Features

- ✅ **Auto-detects remote** (works with 'origin', 'mobile', etc.)
- ✅ **Colored output** for easy reading
- ✅ **Interactive prompts** for commits and confirmation
- ✅ **Error handling** returns you to original branch
- ✅ **Merge conflict detection** with helpful messages
- ✅ **Progress indicators** at each step

## Example Output

```bash
$ yarn release

🚀 Release Trigger Script

📍 Current branch: master
🌐 Using remote: mobile
📡 Remote URL: https://github.com/iOSAS-CdM/mobile.git
📦 Current version: 1.0.2

🔔 Ready to trigger release build v1.0.2? (y/n): y

⬆️  Pushing master to remote...
✅ Pushed successfully

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

🏷️  Version: v1.0.2
```

## Files

- **`scripts/trigger-release.sh`** - The bash script
- **`scripts/trigger-release.js`** - Old Node.js version (can be removed)
- **`package.json`** - Updated to call bash script

## Advantages

1. **No PAT needed** - Uses your system Git credentials
2. **Works everywhere** - Linux, Mac, Windows (with Git Bash)
3. **Better error messages** - Colored, clear output
4. **Faster** - No Node.js startup time
5. **Simpler** - Pure bash, no dependencies

## Migration from Node.js Version

Already done! Just run:

```bash
yarn release
```

The old Node.js script is still there but not used.

## Troubleshooting

### "Failed to push"

Check your Git authentication:

```bash
# Test manual push
git push mobile master

# If it asks for credentials, set up one of the options above
```

### "Remote not found"

The script auto-detects your remote. Check with:

```bash
git remote -v
```

### "Not a git repository"

Make sure you're in the project directory:

```bash
cd /path/to/iOSAS
yarn release
```

## Summary

✅ Simpler authentication (uses system Git)
✅ Colored, beautiful output
✅ Interactive and safe
✅ Auto-detects configuration
✅ Works with SSH, HTTPS, GitHub CLI

Just make sure you can `git push` manually, then `yarn release` will work! 🚀
