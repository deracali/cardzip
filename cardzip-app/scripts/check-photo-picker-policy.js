const fs = require('node:fs');
const path = require('node:path');

const appConfig = require('../app.config.js')({ config: {} });
const requiredBlockedPermissions = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
];
const blockedPermissions = new Set(appConfig.android?.blockedPermissions || []);
const missingPermissions = requiredBlockedPermissions.filter(
  (permission) => !blockedPermissions.has(permission),
);

if (missingPermissions.length > 0) {
  throw new Error(`Android photo-picker policy is missing blocked permissions: ${missingPermissions.join(', ')}`);
}

const sourceDirectory = path.join(__dirname, '..', 'src');
const permissionRequestPattern = /requestMediaLibraryPermissionsAsync|useMediaLibraryPermissions/;
const sourceFiles = [];

function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(entryPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      sourceFiles.push(entryPath);
    }
  }
}

collectSourceFiles(sourceDirectory);

const permissionRequests = sourceFiles.filter((filePath) =>
  permissionRequestPattern.test(fs.readFileSync(filePath, 'utf8')),
);

if (permissionRequests.length > 0) {
  throw new Error(
    `Use the system photo picker without broad media permissions. Remove media-library permission requests from: ${permissionRequests.join(', ')}`,
  );
}

console.log('Photo-picker policy check passed.');
