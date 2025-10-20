module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testMatch: ['**/*.test.js'],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 25,
      lines: 30,
      statements: 30,
    },
  },
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
