module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        diagnostics: {
          ignoreCodes: ['TS151001'],
        },
      },
    ],
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/__mocks__/**',
    '!src/**/__fixtures__/**',
  ],
  moduleNameMapper: {
    '^@atlas/core(.*)$': '<rootDir>/../../packages/core/src$1',
    '^@atlas/config(.*)$': '<rootDir>/../../packages/config/src$1',
    '^@atlas/telemetry(.*)$': '<rootDir>/../../packages/telemetry/src$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/e2e/',
  ],
  globalSetup: undefined,
  globalTeardown: undefined,
  verbose: true,
};
