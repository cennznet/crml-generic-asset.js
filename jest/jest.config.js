module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
    rootDir: process.cwd(),
    moduleFileExtensions: ['ts', 'js', 'node', 'json'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testMatch: ['/**/?(*.)+(spec|e2e).[jt]s?(x)'],
    testEnvironment: 'node',
    preset: 'ts-jest',
    collectCoverageFrom: ['src/**/*.[jt]s?(x)', '!**/node_modules/**'],
    coverageReporters: ['json', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 80,
            lines: 80,
            statements: -10,
        },
    },
    testEnvironment: './jest/env.js',
    moduleNameMapper: {
        '@cennznet/crml-generic-asset(.*)$': '<rootDir>/packages/generic-asset/src/$1'
    },
    modulePathIgnorePatterns: [
        '<rootDir>/build',
        '<rootDir>/packages/generic-asset/build'
    ],
    setupFilesAfterEnv: ['./jest/jest.setup.js']
};
