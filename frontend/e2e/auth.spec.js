import { test, expect } from "@playwright/test"

test.describe('End-To-End EnterPrise Authentication Gateway', () => {
    const testUser = {
        email: 'amir.shaikh@disasterwatch.io',
        password: 'SecurePassword123!',
        firstName: 'Admin',
        lastName: 'User'
    };

    test.beforeAll(async ({ request }) => {
        const backendBaseURL = 'http://localhost:5000';

        await request.post(`${backendBaseURL}/api/auth/deleteUser`, {
            data: { email: testUser.email },
            failOnStatusCode: false,
        });

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

    test.beforeEach(async ({ page }) => {
        page.on('response', async (res) => {
            if (res.request().method() === 'POST' && res.url().includes('/login')) {
                console.log('LOGIN STATUS:', res.status());
                try {
                    console.log('LOGIN BODY:', await res.text());
                } catch (e) {
                    console.log('Could not read body:', e.message);
                }
            }
        });

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

    test('Scenario B: Successful Authentication, deep-link routing redirection and cookie defense verification', async ({ page }) => {

        // enter valid email
        await page.getByLabel(/email/i).fill('amir.shaikh@disasterwatch.io');

        // valid password
        await page.getByLabel(/password/i).fill('SecurePassword123!');

        // press button
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Assert the app automatically re-routes the user to the protected dashboard page
        await expect(page).toHaveURL(/\/sidebar$/);

        await expect(page.locator('aside').getByText(/DisasterWatch/i).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        const activeCookies = await page.evaluate(() => document.cookie);
        expect(activeCookies).not.toContain('refreshToken=');

        await page.reload();
        await expect(page).toHaveURL(/\/sidebar$/);
        await expect(page.getByRole('button', { name: /Log out of application account/i })).toBeVisible();

    });
});
