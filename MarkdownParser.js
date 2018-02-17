const fileStream = require('fs');
const path = require('path');

exports.getLastVersion = filePath => {
  const fullPath = path.join(__dirname, filePath);

  // If file doesn't exist return empty object
  if (!fileStream.existsSync(fullPath)) {
    return {
      version: undefined,
      versionPoints: [],
    };
  }

  const lines = fileStream
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
    version,
    versionPoints,
  };
};
