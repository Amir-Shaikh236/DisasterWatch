/* eslint-disable */
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Playwright needs the same frontend environment used by the Vite app.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!process.env.CI;
const backendDir = path.resolve(__dirname, '../Backend');
const frontendDir = path.resolve(__dirname);

const targetBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

export default defineConfig({

    testDir: './e2e',
    timeout: 30 * 1000,

    // Run assertions in parallel for maximum execution speed
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: isCI,

    workers: isCI ? 1 : undefined,
    retries: isCI ? 2 : 0,
    reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],

    use: {
        baseURL: targetBaseUrl,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },


    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],

    webServer: process.env.FRONTEND_URL ? undefined : [
        {
            command: 'npm run dev',
            cwd: frontendDir,
            url: 'http://localhost:5173',
            reuseExistingServer: !isCI,
            timeout: 120 * 1000,
        },

        {
            command: 'node server.js',
            cwd: backendDir,
            url: 'http://localhost:5000/api/health',
            reuseExistingServer: !isCI,
            timeout: 120 * 1000,
            env: {
                ...process.env,
                NODE_ENV: 'test',
                PORT: '5000',
                TEST_MONGO_URI: process.env.TEST_MONGO_URI || "",
                FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
            },
        },
    ],
});