module.exports = {
    preset: 'jest-puppeteer',
    collectCoverage: true,
    testMatch: ['**/tests/e2e.test.js'],
    rootDir: "../../",
    collectCoverageFrom: [
      '**/src/**/*.js', // Adjust this pattern to match the files for which you want to collect coverage
      '!**/tests/**/*.js',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
  };