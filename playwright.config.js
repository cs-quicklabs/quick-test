// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',       // folder containing your test files
  timeout: 30000,            // 30 seconds per test
  use: {
    headless: false,         // set to true to run in headless mode
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['list'], ['html']], // console + HTML report
};
module.exports = config;
