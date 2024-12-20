// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './'
})

const customJestConfig = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Changed to .js
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx']
}

module.exports = createJestConfig(customJestConfig)