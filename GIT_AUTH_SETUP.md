# Git Authentication Setup Guide

The `yarn release` command requires Git authentication to push to GitHub. Here are the solutions:

## Quick Fix (Recommended for Linux)

### Option 1: Store Credentials (Easiest)

```bash
# Enable credential storage
git config --global credential.helper store

# Try pushing (you'll be prompted once)
git push mobile master

# Enter your credentials when prompted:
# Username: your-github-username
# Password: your-personal-access-token (NOT your GitHub password!)
```

**Note**: You need a Personal Access Token (PAT), not your GitHub password.

## Create a Personal Access Token (PAT)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "iOSAS Development"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when Git asks

## Option 2: SSH Keys (More Secure)

### Generate SSH Key

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location
# Enter a passphrase (optional but recommended)

# Copy your public key
cat ~/.ssh/id_ed25519.pub
```

### Add to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "iOSAS Development Machine"
4. Paste your public key
5. Click "Add SSH key"

### Update Git Remote to Use SSH

```bash
# Check current remote
git remote -v

# If it shows HTTPS (https://github.com/...), change to SSH:
git remote set-url mobile git@github.com:iOSAS-CdM/mobile.git

# Verify
git remote -v
```

### Test SSH Connection

```bash
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

## Option 3: GitHub CLI (Modern Approach)

```bash
# Install GitHub CLI
sudo pacman -S github-cli  # Arch Linux
# or
sudo apt install gh        # Ubuntu/Debian

# Authenticate
gh auth login

# Follow prompts to login with browser
```

## Verify Setup

After setting up authentication, test it:

```bash
# Try pushing
git push mobile master

# If successful, try the release command
yarn release
```

## Troubleshooting

### "Support for password authentication was removed"

You're using your GitHub password instead of a PAT. Create a Personal Access Token (see above).

### "Permission denied (publickey)"

Your SSH key isn't set up correctly. Follow Option 2 above.

### "Could not resolve host"

Check your internet connection.

### "Remote not found"

Your remote name might not be 'origin'. Check with:
```bash
git remote -v
```

The script will automatically detect and use the correct remote name.

## Current Setup

Your repository currently uses:
- **Remote name**: `mobile`
- **Remote URL**: `https://github.com/iOSAS-CdM/mobile.git`

## Recommended: Use Credential Helper

This is the simplest approach for HTTPS:

```bash
# One-time setup
git config --global credential.helper store
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Next push will ask for credentials once
git push mobile master
# Username: your-github-username
# Password: <paste-your-PAT>

# Future pushes won't ask again!
```

## Security Note

- **Never** commit credentials to your repository
- **Never** share your Personal Access Token
- Use different tokens for different machines
- Revoke tokens you're no longer using

---

**After setup**, run `yarn release` and it should work! 🚀
