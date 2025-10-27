# Automatic Versioning System

This project uses **automatic version bumping** via Git hooks. Every time you make a commit, the version in `package.json` is automatically incremented.

## How It Works

### The Flow

1. **You make changes** to your code
2. **You run `git add .`** to stage your changes
3. **You run `git commit -m "Your message"`**
4. **Pre-commit hook triggers automatically** and:
   - Reads the current version from `package.json`
   - Increments the **patch version** (e.g., `1.0.0` → `1.0.1`)
   - Updates `package.json` with the new version
   - Updates `yarn.lock` to reflect the version change
   - Stages both files (`package.json` and `yarn.lock`)
5. **Commit completes** with the bumped version included

### Version Format

The project uses **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes, small changes (auto-incremented)
  │     └─────── New features (manual)
  └───────────── Breaking changes (manual)
```

- **PATCH** (e.g., `1.0.0` → `1.0.1`): Auto-incremented on every commit
- **MINOR** (e.g., `1.0.0` → `1.1.0`): Manual, for new features
- **MAJOR** (e.g., `1.0.0` → `2.0.0`): Manual, for breaking changes

## Usage

### Normal Development (Auto-Bump)

Just commit as usual - versioning happens automatically:

```bash
git add .
git commit -m "fix: Resolve login issue"
# ✅ Version automatically bumped from 1.0.5 → 1.0.6
```

### Feature Release (Manual Minor Bump)

When you add a significant new feature, manually bump the **minor** version:

```bash
# Option 1: Edit package.json manually
# Change "version": "1.0.5" to "version": "1.1.0"

# Option 2: Use npm version command (then revert auto-bump)
npm version minor  # 1.0.5 → 1.1.0

git add .
git commit -m "feat: Add dark mode support"
# ✅ Version will be 1.1.1 after auto-bump
```

### Breaking Change (Manual Major Bump)

For breaking changes, manually bump the **major** version:

```bash
# Edit package.json manually
# Change "version": "1.5.3" to "version": "2.0.0"

git add .
git commit -m "BREAKING CHANGE: New authentication system"
# ✅ Version will be 2.0.1 after auto-bump
```

## Disabling Auto-Versioning (When Needed)

Sometimes you might want to make a commit without bumping the version (e.g., README updates, documentation changes).

### Skip Version Bump for One Commit

```bash
# Skip all Git hooks (including version bump)
git commit -m "docs: Update README" --no-verify
```

### Temporarily Disable Auto-Versioning

To disable version bumping temporarily:

1. **Comment out the hook**:
   ```bash
   # Edit .husky/pre-commit and comment out the bump line:
   # yarn version:bump
   ```

2. **Re-enable when done**:
   ```bash
   # Uncomment the line in .husky/pre-commit
   yarn version:bump
   ```

## Files Involved

### 1. `.husky/pre-commit`
The Git hook that runs before each commit. Calls the version bump script.

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔄 Auto-bumping version..."
yarn version:bump
```

### 2. `scripts/bump-version.js`
Node.js script that:
- Reads `package.json`
- Increments the patch version
- Writes updated `package.json`
- Updates `yarn.lock`
- Stages both files for commit

### 3. `package.json`
Contains:
- The current version number
- The `version:bump` script reference
- Husky prepare script

## Troubleshooting

### Hook Not Running

If the version isn't bumping automatically:

1. **Check if Husky is installed**:
   ```bash
   ls -la .husky/pre-commit
   ```

2. **Reinstall Husky**:
   ```bash
   yarn install
   npx husky install
   ```

3. **Make sure the hook is executable**:
   ```bash
   chmod +x .husky/pre-commit
   chmod +x scripts/bump-version.js
   ```

### Version Conflicts

If you get merge conflicts in `package.json` version:

1. **Resolve the conflict** by picking the higher version number
2. **Commit the resolution**:
   ```bash
   git add package.json
   git commit -m "chore: Resolve version conflict"
   ```

### Yarn Lock Issues

If `yarn.lock` shows errors during version bump:

```bash
# Regenerate yarn.lock
rm yarn.lock
yarn install
git add yarn.lock
git commit -m "chore: Regenerate yarn.lock"
```

## Integration with GitHub Actions

The automatic versioning works seamlessly with the GitHub Actions build workflow:

1. **You commit** → Version bumped to `1.0.5`
2. **You push to release branch** → GitHub Actions builds
3. **GitHub Release created** with tag `v1.0.5-123`
4. **APK/AAB** includes version `1.0.5`

Each build has a unique version number, making it easy to track which code is in which build.

## Best Practices

### ✅ DO

- Let auto-versioning handle patch versions for regular commits
- Manually bump minor/major versions for significant changes
- Include version context in commit messages (e.g., "feat:", "fix:", "BREAKING:")
- Use `--no-verify` for non-code commits (docs, config)

### ❌ DON'T

- Manually edit version in `package.json` for small changes (let auto-bump handle it)
- Commit broken code (the version will still increment)
- Skip version bumps without good reason (creates inconsistency)

## Commit Message Conventions

Use conventional commits for better changelog generation:

- `feat:` - New feature (consider manual minor bump)
- `fix:` - Bug fix (auto patch bump is fine)
- `docs:` - Documentation only (consider `--no-verify`)
- `style:` - Code style changes (auto patch bump)
- `refactor:` - Code refactoring (auto patch bump)
- `test:` - Adding tests (auto patch bump)
- `chore:` - Maintenance (consider `--no-verify`)
- `BREAKING CHANGE:` - Breaking changes (manual major bump required)

## Examples

### Example 1: Bug Fix

```bash
git add src/components/Button.jsx
git commit -m "fix: Resolve button click handler"
# Version: 1.0.5 → 1.0.6
```

### Example 2: New Feature (Minor Version)

```bash
# Manually update package.json version to 1.1.0
git add .
git commit -m "feat: Add user profile page"
# Version: 1.1.0 → 1.1.1 (auto-bump still happens)
```

### Example 3: Documentation Update (Skip Bump)

```bash
git add README.md
git commit -m "docs: Update installation instructions" --no-verify
# Version stays the same
```

## Summary

✅ **Automatic** - Version bumps on every commit without thinking
✅ **Traceable** - Every build has a unique version
✅ **Semantic** - Follows SemVer conventions
✅ **Flexible** - Can be skipped when needed
✅ **Integrated** - Works with GitHub Actions and Releases

You never have to remember to bump versions manually again! 🎉
