module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    testMatch: ["**/tests/unitTests.test.js"],
    rootDir: "../../",
    collectCoverageFrom: [
      '**/src/**/*.js', // Adjust this pattern to match the files for which you want to collect coverage
      '!**/tests/**/*.js',
    ],
    coverageReporters: ['json', 'lcov', 'text', 'clover']
  };