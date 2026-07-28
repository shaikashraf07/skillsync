const path = require('path');

exports.config = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  port: 4723,
  specs: [
    './tests/**/*.test.js'
  ],
  exclude: [],

  // ==================
  // Capabilities
  // ==================
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Emulator',
    'appium:app': path.join(__dirname, '../frontend/android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appPackage': 'com.skillsync.app',
    'appium:appActivity': 'com.skillsync.app.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 240
  }],

  // ===================
  // Test Configurations
  // ===================
  logLevel: 'warn',
  bail: 0,
  baseUrl: 'http://localhost:5000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
};
