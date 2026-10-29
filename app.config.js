// Lets the web demo export (`npm run export:web-demo`) be served from a sub-path of the
// marketing site without changing app.json for native builds or the local web preview.
module.exports = ({ config }) =>
  process.env.WEB_BASE_URL
    ? { ...config, experiments: { ...config.experiments, baseUrl: process.env.WEB_BASE_URL } }
    : config;
