#!/usr/bin/env node

/**
 * Release Trigger Script
 * 
 * This script automates the process of triggering a release build by:
 * 1. Ensuring all changes are committed
 * 2. Switching to the release branch
 * 3. Merging master into release
 * 4. Pushing to trigger GitHub Actions build
 * 5. Switching back to master
 * 
 * Usage: yarn release
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function exec(command, options = {}) {
	try {
		return execSync(command, {
			encoding: 'utf8',
			stdio: options.silent ? 'pipe' : 'inherit',
			...options
		});
	} catch (error) {
		console.error(`❌ Error executing: ${command}`);
		console.error(error.message);
		process.exit(1);
	}
}

function askQuestion(query) {
	return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
	console.log('🚀 Release Trigger Script\n');

	// Check if we're in a git repository
	try {
		exec('git rev-parse --git-dir', { silent: true });
	} catch {
		console.error('❌ Not a git repository');
		process.exit(1);
	}

	// Get current branch
	const currentBranch = exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
	console.log(`📍 Current branch: ${currentBranch}`);

	// Check for uncommitted changes
	const status = exec('git status --porcelain', { silent: true }).trim();
	if (status) {
		console.log('\n⚠️  You have uncommitted changes:');
		console.log(status);

		const answer = await askQuestion('\nDo you want to commit them now? (y/n): ');
		if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
			const message = await askQuestion('Enter commit message: ');
			console.log('\n📝 Committing changes...');
			exec(`git add .`);
			exec(`git commit -m "${message}"`);
			console.log('✅ Changes committed');
		} else {
			console.log('\n❌ Please commit or stash your changes before releasing');
			process.exit(1);
		}
	}

	// Get current version
	const packageJson = require('../package.json');
	const version = packageJson.version;
	console.log(`\n📦 Current version: ${version}`);

	// Confirm release
	const confirm = await askQuestion(`\n🔔 Ready to trigger release build v${version}? (y/n): `);
	if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
		console.log('❌ Release cancelled');
		process.exit(0);
	}

	try {
		// Push current branch first
		console.log(`\n⬆️  Pushing ${currentBranch} to remote...`);
		exec(`git push origin ${currentBranch}`);

		// Switch to release branch
		console.log('\n🔀 Switching to release branch...');
		exec('git checkout release');

		// Pull latest from release
		console.log('⬇️  Pulling latest release...');
		exec('git pull origin release');

		// Merge master into release
		console.log(`\n🔀 Merging ${currentBranch} into release...`);
		exec(`git merge ${currentBranch} --no-edit`);

		// Push release branch
		console.log('\n🚀 Pushing release branch to trigger build...');
		exec('git push origin release');

		// Switch back to original branch
		console.log(`\n🔙 Switching back to ${currentBranch}...`);
		exec(`git checkout ${currentBranch}`);

		console.log('\n✅ Release triggered successfully!');
		console.log('\n📊 Monitor the build at:');
		console.log('   https://github.com/iOSAS-CdM/mobile/actions');
		console.log('\n📦 Release will be available at:');
		console.log('   https://github.com/iOSAS-CdM/mobile/releases');
		console.log(`\n🏷️  Version: v${version}`);

	} catch (error) {
		console.error('\n❌ Release failed:', error.message);
		console.log('\n🔙 Attempting to return to original branch...');
		try {
			exec(`git checkout ${currentBranch}`);
		} catch { }
		process.exit(1);
	} finally {
		rl.close();
	}
}

main();
