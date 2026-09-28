import { defineConfig } from 'vitest/config'
export default defineConfig({
    test: {
        // Explicitly point to your test folder pattern
        include: ['**/tests/**/*Test.js', '**/tests/**/*.test.js'],

        // Disable parallel worker threads to prevent MongoDB memory server connection clashes
        threads: false,
        isolate: true,
        testTimeout: 60000,
        hookTimeout: 60000,
    },
});