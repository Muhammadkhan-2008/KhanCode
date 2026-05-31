const { execSync } = require('child_process');
execSync('git push origin HEAD:main', { stdio: 'inherit' });
