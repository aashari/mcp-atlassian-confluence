#!/usr/bin/env node

/**
 * Script to update version numbers across the project
 * Usage: node scripts/update-version.js <new-version>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Get the new version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
	console.error('Error: No version specified');
	console.error('Usage: node scripts/update-version.js <new-version>');
	process.exit(1);
}

// Validate version format (simple check for semver-like format)
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(newVersion)) {
	console.error(
		'Error: Invalid version format. Please use semver format (e.g., 1.2.3, 1.2.3-beta, etc.)',
	);
	process.exit(1);
}

// Update package.json
const packageJsonPath = path.join(rootDir, 'package.json');
try {
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	const oldVersion = packageJson.version;
	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n');
	console.log(`Updated package.json: ${oldVersion} → ${newVersion}`);
} catch (error) {
	console.error(`Error updating package.json: ${error.message}`);
	process.exit(1);
}

// Update src/index.ts
const indexTsPath = path.join(rootDir, 'src', 'index.ts');
try {
	let indexTsContent = fs.readFileSync(indexTsPath, 'utf8');
	const versionRegex = /(version: ['"])([^'"]+)(['"])/;
	const match = indexTsContent.match(versionRegex);

	if (match) {
		const oldVersion = match[2];
		indexTsContent = indexTsContent.replace(versionRegex, `$1${newVersion}$3`);
		fs.writeFileSync(indexTsPath, indexTsContent);
		console.log(`Updated src/index.ts: ${oldVersion} → ${newVersion}`);
	} else {
		console.warn('Warning: Could not find version in src/index.ts');
	}
} catch (error) {
	console.error(`Error updating src/index.ts: ${error.message}`);
	process.exit(1);
}

// Update src/cli/index.ts
const cliIndexTsPath = path.join(rootDir, 'src', 'cli', 'index.ts');
try {
	if (fs.existsSync(cliIndexTsPath)) {
		let cliIndexTsContent = fs.readFileSync(cliIndexTsPath, 'utf8');

		// Update VERSION constant
		const versionRegex = /(const VERSION = ['"])([^'"]+)(['"])/;
		const versionMatch = cliIndexTsContent.match(versionRegex);

		if (versionMatch) {
			const oldVersion = versionMatch[2];
			cliIndexTsContent = cliIndexTsContent.replace(versionRegex, `$1${newVersion}$3`);
			console.log(`Updated VERSION in src/cli/index.ts: ${oldVersion} → ${newVersion}`);
		} else {
			console.warn('Warning: Could not find VERSION constant in src/cli/index.ts');
		}

		// Get package.json again to ensure we have the data
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		const packageName = packageJson.name;
		const packageDescription = packageJson.description;

		// Update NAME constant if it exists
		const nameRegex = /(const NAME = ['"])([^'"]+)(['"])/;
		const nameMatch = cliIndexTsContent.match(nameRegex);

		if (nameMatch && packageName) {
			const oldName = nameMatch[2];
			cliIndexTsContent = cliIndexTsContent.replace(nameRegex, `$1${packageName}$3`);
			console.log(`Updated NAME in src/cli/index.ts: ${oldName} → ${packageName}`);
		}

		// Update DESCRIPTION constant if it exists
		const descriptionRegex = /(const DESCRIPTION =\s*['"])([^'"]+)(['"])/;
		const descriptionMatch = cliIndexTsContent.match(descriptionRegex);

		if (descriptionMatch && packageDescription) {
			const oldDescription = descriptionMatch[2];
			cliIndexTsContent = cliIndexTsContent.replace(
				descriptionRegex,
				`$1${packageDescription}$3`,
			);
			console.log(
				`Updated DESCRIPTION in src/cli/index.ts: ${oldDescription} → ${packageDescription}`,
			);
		}

		// Write the updated content back to the file
		fs.writeFileSync(cliIndexTsPath, cliIndexTsContent);
	}
} catch (error) {
	console.error(`Error updating src/cli/index.ts: ${error.message}`);
	process.exit(1);
}

// Update src/utils/config.util.ts
const configUtilPath = path.join(rootDir, 'src', 'utils', 'config.util.ts');
try {
	if (fs.existsSync(configUtilPath)) {
		let configUtilContent = fs.readFileSync(configUtilPath, 'utf8');

		// Get package.json again to ensure we have the data
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
		const packageName = packageJson.name;

		// Update package name in config loader
		const packageNameRegex = /(new ConfigLoader\(['"])([^'"]+)(['"])/;
		const packageNameMatch = configUtilContent.match(packageNameRegex);

		if (packageNameMatch && packageName) {
			const oldPackageName = packageNameMatch[2];
			configUtilContent = configUtilContent.replace(packageNameRegex, `$1${packageName}$3`);
			console.log(
				`Updated package name in src/utils/config.util.ts: ${oldPackageName} → ${packageName}`,
			);

			// Write the updated content back to the file
			fs.writeFileSync(configUtilPath, configUtilContent);
		}
	}
} catch (error) {
	console.error(`Error updating src/utils/config.util.ts: ${error.message}`);
	// Don't exit, just log the error
}

console.log(`\nVersion successfully updated to ${newVersion}`);
