const fileStream = require('fs');
const path = require('path');
const readline = require('readline');

exports.getLastVersion = filePath => {
  const fullPath = path.join(__dirname, filePath);
  const lines = require('fs')
    .readFileSync(fullPath, 'utf-8')
    .split('\n')
    .filter(Boolean);

  let version;
  let shouldRead = true;
  const versionPoints = [];

  // Looping through each line of CHANGELOG
  lines.forEach(line => {
    // Get the first version only
    if (line.indexOf('##') > -1) {
      if (!version) {
        // If the line is second headline
        version = line.replace('## ', '');
      } else {
        shouldRead = false;
      }
    }

    if (line.indexOf('*') > -1 && shouldRead) {
      // If the line is a bullet point
      versionPoints.push(line.replace('* ', ''));
    }
  });

  return {
    version: version,
    versionPoints: versionPoints
  };
};
