import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['__tests__/**/*.test.js', '__tests__/**/*.test.mjs'],
        restoreMocks: true,
        env: {
            AIRTABLE_API_KEY: 'fake-test-key',
            AIRTABLE_BASE: 'fake-test-base',
        },
    },
});
