/* eslint-disable */
import { defineConfig, devices } from '@playwright/test';
import path from 'path'
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../Backend/.env") });

const isCI = !!process.env.CI
const backendDir = path.resolve(__dirname, '../Backend');
const frontendDir = path.resolve(__dirname);

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
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    // Configure major browser test projects
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

    /* Automatically spin up your local dev servers before starting tests */
    webServer: [
        {
            command: 'npm run dev',
            cwd: frontendDir,
            url: 'http://localhost:5173',
            reuseExistingServer: !isCI,
            timeout: 120 * 1000,
        },

        {
            // Adjust this path/command if your backend sits in a separate terminal workspace
            command: 'node server.js',
            cwd: backendDir,
            url: 'http://localhost:5000',
            reuseExistingServer: !isCI,
            timeout: 120 * 1000,
            env: {
                ...process.env,
                NODE_ENV: 'test',
                PORT: '5000',
                MONGO_URI: process.env.MONGO_URI || "",
                FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
            },
        },
    ],
});