import { test, expect } from "@playwright/test"

const backendBaseURL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

test.describe('End-To-End EnterPrise Authentication Gateway', () => {

    let testUser;

    const clearAll = async (request) => {
        await request.post(`${backendBaseURL}/api/auth/user/delete`, {
            data: { email: testUser.email },
            failOnStatusCode: false,
        });
    };

    test.beforeAll(async ({ request }) => {
        testUser = {
            email: `e2e.${test.info().project.name}.${test.info().workerIndex}@disasterwatch.io`,
            password: 'SecurePassword123!',
            firstName: 'Admin',
            lastName: 'User'
        };

        await clearAll(request);

        const registerResponse = await request.post(`${backendBaseURL}/api/auth/register`, {
            data: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
                password: testUser.password,
            },

            failOnStatusCode: false,
        });

        if (![201, 403].includes(registerResponse.status())) {
            throw new Error(`Failed to create E2E test user: ${registerResponse.status()} ${await registerResponse.text()}`);
        }
    });

    test.afterAll(async ({ request }) => {
        await clearAll(request)
    });

    test.beforeEach(async ({ page }) => {
        // These just for debugging errors while testing

        // page.on('response', async (res) => {
        //     if (res.request().method() === 'POST') {
        //         console.log('POST →', res.url(), 'STATUS:', res.status());
        //     }
        // });

        // page.on('requestfailed', (req) => {
        //     console.log('REQUEST FAILED →', req.url(), req.failure()?.errorText);
        // });

        // page.on('console', (msg) => {
        //     if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
        // });

        await page.context().clearCookies();
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('Scenario A: User Submits incorrect credentials and encounters real API rejection.', async ({ page }) => {

        // Locate elements purely via user-facing accessible labels, never fragile CSS selectors
        const emailInput = page.getByLabel(/email/i);
        const passwordInput = page.getByLabel(/password/i);
        const submitBtn = page.getByRole('button', { name: 'Login', exact: true });

        // Type credentials and submit through the real browser loop
        await emailInput.fill('wrong.user@disasterWatch.io');
        await passwordInput.fill('InvalidPassowrd123!');
        await submitBtn.click();

        // Playwright auto-waits for the server response roundtrip and asserts the UI shift
        const errorMessage = page.getByText(/Incorrect email or password/i);
        await expect(errorMessage).toBeVisible();

        // Ensure the interface releases the button state so a user can try typing again
        await expect(submitBtn).toBeEnabled();
    });

    // test('Scenario B: Successful Authentication, deep-link routing redirection and cookie defense verification', async ({ page }) => {

    //     // enter valid email
    //     await page.getByLabel(/email/i).fill(testUser.email);

    //     // valid password
    //     await page.getByLabel(/password/i).fill(testUser.password);

    //     // press button
    //     await page.getByRole('button', { name: 'Login', exact: true }).click();

    //     // Assert the app automatically re-routes the user to the protected dashboard page
    //     await expect(page).toHaveURL(/\/dashboard$/);

    //     await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();
    //     await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    //     const activeCookies = await page.evaluate(() => document.cookie);
    //     expect(activeCookies).not.toContain('refreshToken=');

    //     await page.reload();
    //     await expect(page).toHaveURL(/\/dashboard$/);

    // });
});
