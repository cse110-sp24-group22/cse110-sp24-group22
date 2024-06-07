module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ['**/tests/e2e.test.js'],
    rootDir: "../../",
    coverageReporters: [['lcov', { projectRoot: '/src/' }]]
  };