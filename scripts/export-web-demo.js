// Exports the web build of the app for the live demo on the marketing site, served from /demo.
// Usage: npm run export:web-demo [-- <output dir>]
// Defaults to the site repo checked out next to this one (benjylarcher/public/tongueup/demo).
const { spawnSync } = require('child_process');
const path = require('path');

const outputDir = process.argv[2] ?? path.resolve(__dirname, '../../benjylarcher/public/tongueup/demo');

const result = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--clear', '--output-dir', outputDir], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, WEB_BASE_URL: '/demo' },
});
process.exit(result.status ?? 1);
