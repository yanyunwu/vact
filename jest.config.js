/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules',
  ],
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/packages/vact-router/test/**/*.test.ts'
  ]
};
