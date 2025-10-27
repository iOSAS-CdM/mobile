# Quick Start Guide - iOSAS Mobile

## Daily Development Workflow

### 1. Make Changes
```bash
# Edit your code
code src/components/MyComponent.jsx
```

### 2. Commit
```bash
git add .
git commit -m "feat: Add new feature"
# ✅ Version automatically bumps (e.g., 1.0.5 → 1.0.6)
```

### 3. Release
```bash
yarn release
# ✅ Automatically triggers build on GitHub Actions
```

That's it! 🎉

## What Happens Automatically

When you run `yarn release`:

1. ✅ Checks for uncommitted changes
2. ✅ Pushes your current branch
3. ✅ Merges master → release
4. ✅ Triggers GitHub Actions build
5. ✅ Returns you to your original branch

## Download Your Build

After ~5-10 minutes:

1. Go to: https://github.com/iOSAS-CdM/mobile/releases
2. Click the latest release
3. Download APK or AAB

## Common Commands

| Command                  | What It Does                           |
| ------------------------ | -------------------------------------- |
| `yarn release`           | Trigger a production build             |
| `yarn start`             | Start development server               |
| `yarn android`           | Run on Android device                  |
| `yarn ios`               | Run on iOS device                      |
| `git commit --no-verify` | Commit without version bump (for docs) |

## Version Numbers

Versions automatically increment on every commit:
- **Before commit**: `1.0.5`
- **After commit**: `1.0.6`
- **After another commit**: `1.0.7`

For feature releases, manually bump minor version:
```bash
# Edit package.json: "version": "1.0.7" → "1.1.0"
git commit -m "feat: Major new feature"
# Version becomes 1.1.1 after auto-bump
```

## Troubleshooting

### Build Failed
Check: https://github.com/iOSAS-CdM/mobile/actions

### Version Not Bumping
```bash
# Reinstall hooks
yarn install
npx husky install
```

### Release Command Not Working
```bash
# Make sure you're on master branch
git checkout master

# Then try again
yarn release
```

## Documentation

- **Full Build Guide**: `GITHUB_ACTIONS_BUILD.md`
- **Versioning Guide**: `AUTO_VERSIONING.md`
- **EAS Build Guide**: `EAS_BUILD.md`

## Quick Links

- **Repository**: https://github.com/iOSAS-CdM/mobile
- **Actions**: https://github.com/iOSAS-CdM/mobile/actions
- **Releases**: https://github.com/iOSAS-CdM/mobile/releases

---

**Remember**: Just code, commit, and run `yarn release`. Everything else is automatic! 🚀
