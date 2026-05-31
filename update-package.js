const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'package.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
data.scripts = data.scripts || {};
data.scripts.build = "parcel build www/index.html";
fs.writeFileSync(p, JSON.stringify(data, null, 2));
