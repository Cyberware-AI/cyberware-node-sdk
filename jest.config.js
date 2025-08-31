/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true, // Automatically clear mock calls and instances between every test
  coverageDirectory: 'coverage', // Directory where coverage reports will be saved
  collectCoverageFrom: [
    // Specify files to include in coverage report
    'src/**/*.ts',
    '!src/index.ts', // Exclude the main index file (usually just exports)
    '!src/types.ts', // Exclude type definitions
  ],
  testMatch: [
    // Patterns Jest uses to detect test files
    '**/test/**/*.test.ts',
  ],
};
