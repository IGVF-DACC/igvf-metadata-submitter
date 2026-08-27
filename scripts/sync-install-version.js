const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const versionFilePath = path.join(repoRoot, 'functions', 'Version.js');
const installDocPath = path.join(repoRoot, 'docs', 'INSTALL.md');

function getScriptVersion(versionFileContent) {
  const match = versionFileContent.match(/SCRIPT_VERSION\s*=\s*["'](v\d+\.\d+\.\d+)["']\s*;/);
  if (!match) {
    throw new Error(
      "Could not parse SCRIPT_VERSION from functions/Version.js. Expected format: SCRIPT_VERSION='vX.Y.Z';"
    );
  }
  return match[1];
}

function updateInstallTitleVersion(installContent, scriptVersion) {
  const titlePattern = /(--title\s+"IGVF Metadata Submitter\s+)v\d+\.\d+\.\d+(")/;
  if (!titlePattern.test(installContent)) {
    throw new Error('Could not find "--title \\"IGVF Metadata Submitter vX.Y.Z\\"" in docs/INSTALL.md.');
  }
  return installContent.replace(titlePattern, `$1${scriptVersion}$2`);
}

function main() {
  const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
  const installContent = fs.readFileSync(installDocPath, 'utf8');

  const scriptVersion = getScriptVersion(versionFileContent);
  const updatedInstallContent = updateInstallTitleVersion(installContent, scriptVersion);

  if (updatedInstallContent !== installContent) {
    fs.writeFileSync(installDocPath, updatedInstallContent, 'utf8');
    process.stdout.write(`Updated docs/INSTALL.md title to ${scriptVersion}\n`);
  } else {
    process.stdout.write(`docs/INSTALL.md already up to date (${scriptVersion})\n`);
  }
}

main();
