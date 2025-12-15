// generate-env-config.js
const fs = require('fs');
const apiBase = process.env.API_BASE || '';
const content = `window.APP_ENV = { API_BASE: "${apiBase}" };`;
fs.writeFileSync('./js/env_config.js', content);
