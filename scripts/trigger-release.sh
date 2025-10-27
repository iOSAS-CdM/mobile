#!/bin/bash

###############################################################################
# Release Trigger Script
# 
# Automates the process of triggering a release build by:
# 1. Checking for uncommitted changes
# 2. Switching to the release branch
# 3. Merging master into release
# 4. Pushing to trigger GitHub Actions build
# 5. Switching back to master
#
# Usage: yarn release
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_step() {
    echo -e "${CYAN}$1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

echo -e "${PURPLE}🚀 Release Trigger Script${NC}\n"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
print_info "📍 Current branch: $CURRENT_BRANCH"

# Detect remote name (prefer origin, but fall back to first available)
REMOTE_NAME=$(git remote | grep -m 1 "^origin$" || git remote | head -n 1)
if [ -z "$REMOTE_NAME" ]; then
    print_error "No git remote found"
    exit 1
fi
print_info "🌐 Using remote: $REMOTE_NAME"

# Get remote URL
REMOTE_URL=$(git remote get-url "$REMOTE_NAME" 2>/dev/null || echo "unknown")
print_info "📡 Remote URL: $REMOTE_URL"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit them now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " COMMIT_MSG
        print_step "📝 Committing changes..."
        git add .
        git commit -m "$COMMIT_MSG"
        print_success "Changes committed"
    else
        print_error "Please commit or stash your changes before releasing"
        exit 1
    fi
fi

# Get current version from package.json
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
print_info "📦 Current version: $VERSION"
echo ""

# Confirm release
read -p "🔔 Ready to trigger release build v$VERSION? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Release cancelled"
    exit 0
fi

# Function to handle errors and return to original branch
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Release failed"
        print_step "🔙 Returning to $CURRENT_BRANCH..."
        git checkout "$CURRENT_BRANCH" 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo ""
print_step "⬆️  Pushing $CURRENT_BRANCH to remote..."
if ! git push "$REMOTE_NAME" "$CURRENT_BRANCH"; then
    print_error "Failed to push. Make sure you have push access to the repository."
    print_info "💡 You may need to authenticate with GitHub:"
    print_info "   - Use 'gh auth login' if you have GitHub CLI"
    print_info "   - Or set up SSH keys: https://docs.github.com/en/authentication"
    exit 1
fi

echo ""
print_step "🔀 Switching to release branch..."
if ! git checkout release 2>/dev/null; then
    print_warning "Release branch doesn't exist locally, creating it..."
    git checkout -b release
fi

echo ""
print_step "⬇️  Pulling latest release..."
git pull "$REMOTE_NAME" release 2>/dev/null || print_info "   (No existing remote branch, will create on push)"

echo ""
print_step "🔀 Merging $CURRENT_BRANCH into release..."
if ! git merge "$CURRENT_BRANCH" --no-edit; then
    print_error "Merge conflict! Please resolve conflicts and run the script again."
    git merge --abort 2>/dev/null || true
    git checkout "$CURRENT_BRANCH"
    exit 1
fi

echo ""
print_step "🚀 Pushing release branch to trigger build..."
git push "$REMOTE_NAME" release

echo ""
print_step "🔙 Switching back to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

echo ""
print_success "Release triggered successfully!"
echo ""
print_info "📊 Monitor the build at:"
print_info "   https://github.com/iOSAS-CdM/mobile/actions"
echo ""
print_info "📦 Release will be available at:"
print_info "   https://github.com/iOSAS-CdM/mobile/releases"
echo ""
print_info "🏷️  Version: v$VERSION"
echo ""
