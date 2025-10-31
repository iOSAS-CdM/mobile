#!/usr/bin/env node

/**
 * Automatic Version Bump Script
 * 
 * This script automatically increments the patch version in package.json
 * whenever a commit is made. This ensures every build has a unique version.
 * 
 * Version format: MAJOR.MINOR.PATCH
 * This script increments PATCH (e.g., 1.0.0 -> 1.0.1)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
// Path to app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
	// Read package.json
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	const currentVersion = packageJson.version;

	// Parse version parts
	const versionParts = currentVersion.split('.');
	const major = parseInt(versionParts[0], 10);
	const minor = parseInt(versionParts[1], 10);
	const patch = parseInt(versionParts[2], 10);

	// Increment patch version
	const newPatch = patch + 1;
	const newVersion = `${major}.${minor}.${newPatch}`;

	// Update package.json
	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

	console.log(`✅ Version bumped: ${currentVersion} → ${newVersion}`);

	// Read app.json
	const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

	// Update expo.version
	appJson.expo.version = newVersion;

	// Update expo.runtimeVersion
	appJson.expo.runtimeVersion = newVersion;

	// Write back app.json
	fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

	console.log(`✅ App.json version updated`);

	// Stage the updated files
	execSync('git add package.json app.json', { stdio: 'inherit' });

	// Update yarn.lock if it exists
	const yarnLockPath = path.join(__dirname, '..', 'yarn.lock');
	if (fs.existsSync(yarnLockPath)) {
		console.log('📦 Updating yarn.lock...');
		execSync('yarn install --mode update-lockfile', { stdio: 'inherit' });
		execSync('git add yarn.lock', { stdio: 'inherit' });
	};

	console.log('✨ Version files staged for commit');

} catch (error) {
	console.error('❌ Error bumping version:', error.message);
	process.exit(1);
};
