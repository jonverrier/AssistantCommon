/**
 * Jest configuration for AssistantCommon unit tests.
 */
// Copyright (c) 2025, 2026 Jon Verrier

/** @type {import('jest').Config} */
const tsJestTransform = {
   '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }]
};

/** @type {import('jest').Config} */
module.exports = {
   projects: [
      {
         displayName: 'unit',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: ['**/*.test.ts'],
         transform: tsJestTransform,
         collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
         testTimeout: 10_000
      },
      {
         displayName: 'ci',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: [
            '**/asserts.test.ts',
            '**/sanitize.test.ts',
            '**/dateFormat.test.ts'
         ],
         transform: tsJestTransform,
         testTimeout: 10_000
      }
   ]
};
