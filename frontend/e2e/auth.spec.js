/* eslint-disable */

import { expect, test } from "@playwright/test";
const backendBaseURL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

test.describe.serial('End-To-End EnterPrise Authentication Gateway Of Login', () => {

    let testUser;

    const clearAll = async (request) => {
        const loginResponse = await request.post(`${backendBaseURL}/api/auth/login`, {
            data: { email: testUser.email, password: testUser.password },
            failOnStatusCode: false,
        });

        if (loginResponse.status() !== 200) return;

        const { accessToken } = await loginResponse.json();
        const deleteResponse = await request.post(`${backendBaseURL}/api/auth/user/delete`, {
            data: { email: testUser.email },
            headers: { Authorization: `Bearer ${accessToken}` },
            failOnStatusCode: false,
        });

        if (![200, 404].includes(deleteResponse.status())) {
            throw new Error(`Failed to delete E2E test user: ${deleteResponse.status()} ${await deleteResponse.text()}`);
        }
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
        // TEMP DIAGNOSTIC — capture browser console + network + page errors into the CI log
        // page.on('console', msg => console.log(`[browser console:${msg.type()}]`, msg.text()));
        // page.on('pageerror', err => console.log('[browser pageerror]', err.message));
        // page.on('requestfailed', req =>
        //     console.log('[request failed]', req.url(), req.failure()?.errorText)
        // );

        // page.on('response', async res => {
        //     if (res.status() >= 400) {
        //         console.log('[bad response]', res.status(), res.url());
        //     }
        // });

        await page.context().clearCookies();
        await page.goto('/');
        await expect(page.getByRole('heading', { name: /Log in/i })).toBeVisible();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('Scenario A: Successful Authentication, deep-link routing redirection and cookie defense verification', async ({ page }) => {

        // enter valid email
        await page.getByLabel(/email/i).fill(testUser.email)

        // valid password
        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        // press button
        await page.getByRole('button', { name: /login/i }).click()

        // Wait for the real success signal from the app before asserting the redirect.
        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });

        // Assert the app automatically re-routes the user to the protected dashboard page
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

        await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        const activeCookies = await page.evaluate(() => document.cookie);
        expect(activeCookies).not.toContain('refreshToken=');

        await page.reload();
        await expect(page).toHaveURL(/\/dashboard$/);

    });

    test('Scenario B: User Submits incorrect credentials and encounters real API rejection.', async ({ page }) => {

        // Locate elements purely via user-facing accessible labels, never fragile CSS selectors
        await page.getByLabel(/email/i).fill('wrong.user@disasterWatch.io')
        await page.getByLabel(/password/i).fill('InvalidPassowrd123!')

        const submitBtn = page.getByRole('button', { name: 'Login', exact: true });
        const responsePromise = page.waitForResponse(res => res.url().includes('/api/auth/login'));
        await submitBtn.click()

        const response = await responsePromise;
        expect(response.status()).toBe(401)

        await expect(page.getByText(/Incorrect email or Password/i)).toBeVisible();

        // Ensure the interface releases the button state so a user can try typing again
        await expect(submitBtn).toBeEnabled();
    });

    test('Scenario C: User Submits Invalid Email Format', async ({ page }) => {

        await page.getByLabel(/email/i).fill('wrong.userdisasterWatch.io')
        await page.getByLabel(/password/i).fill('InvalidPassowrd123!')

        const submitBtn = page.getByRole('button', { name: 'Login', exact: true });
        await submitBtn.click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
        await expect(submitBtn).toBeEnabled();
    });

    test('Scenario D: User Submits Empty Email Field', async ({ page }) => {
        await page.getByLabel(/email/i).fill('')
        await page.getByLabel(/password/i).fill('SecurePassword123!')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
    });

    test('Scenario E: User will see the error for missing length of password or not providing it', async ({ page }) => {
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByLabel(/password/i).fill('secu')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('Scenario F: User will be redirected to register Page after clicking on Register', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: /Log in/i })
        expect(loginHeader).toBeVisible();

        const registerLing = page.getByRole('link', { name: /register/i })
        await registerLing.click()
        expect(loginHeader).not.toBeVisible();

        await expect(page.getByRole('heading', { name: /Create Your Account/i })).toBeVisible()

    });

});

test.describe.serial('End-To-End EnterPrise Authentication Gateway Of Register', () => {

    let testUser;

    const clearAll = async (request) => {
        const loginResponse = await request.post(`${backendBaseURL}/api/auth/login`, {
            data: { email: testUser.email, password: testUser.password },
            failOnStatusCode: false,
        });

        if (loginResponse.status() !== 200) return;

        const { accessToken } = await loginResponse.json();
        const deleteResponse = await request.post(`${backendBaseURL}/api/auth/user/delete`, {
            data: { email: testUser.email },
            headers: { Authorization: `Bearer ${accessToken}` },
            failOnStatusCode: false,
        });

        if (![200, 404].includes(deleteResponse.status())) {
            throw new Error(`Failed to delete E2E test user: ${deleteResponse.status()} ${await deleteResponse.text()}`);
        }
    };

    test.beforeAll(async ({ request }) => {

        testUser = {
            email: `e2e.${test.info().project.name}.${test.info().workerIndex}@disasterwatch.io`,
            password: 'SecurePassword123!',
            firstName: 'Admin',
            lastName: 'User'
        };

        await clearAll(request);

    });

    test.afterAll(async ({ request }) => {
        await clearAll(request)
    });

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('/register');
        await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('Scenario A: Successful Authentication, deep-link routing redirection and cookie defense verification', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(registerBtn).toBeDisabled()

        // Wait for the real success signal from the app before asserting the redirect.
        await expect(page.getByText(/Admin User account created successfully!/i)).toBeVisible({ timeout: 15000 });

        // Assert the app automatically re-routes the user to the protected dashboard page
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

        await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        const activeCookies = await page.evaluate(() => document.cookie);
        expect(activeCookies).not.toContain('refreshToken=');

        await page.reload();
        await expect(page).toHaveURL(/\/dashboard$/);

    });

    test('Scenario B: First Name is required field so user must get an error', async ({ page }) => {

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();

    });

    test('Scenario B: First Name Below Minimum Length', async ({ page }) => {

        await page.getByLabel('First Name').fill('Ami')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('Scenario B: First Name exceeding Maximum Length', async ({ page }) => {

        await page.getByLabel('First Name').fill('12345678901234587')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('Scenario C: Last Name is required field so user must get an error', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('Scenario C: Last Name Below Minimum Length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('Ami')
        await page.getByLabel(/email/i).fill(testUser.email)
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();

    });

    test('Scenario B: Last Name exceeding Maximum Length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('123456789012345891')
        await page.getByLabel('First Name').fill('Amir')
        await expect(page.getByText(/Last Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('Scenario D: User must get all the required fields errors', async ({ page }) => {

        const registerBtn = page.locator('form button[type="submit"]')
        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

    test('Scenario E: Invalid Email Format', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill('amir21.com')

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();

    });

    test('Scenario F: Duplicate Email Registration', async ({ page, request }) => {

        await request.post(`${backendBaseURL}/api/auth/register`, {
            data: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: 'skamir2410@gmail.com',
                password: testUser.password,
            },

            failOnStatusCode: false,
        });

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill('skamir2410@gmail.com')

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/User with this email already exist/i)).toBeVisible({ timeout: 15000 });

    });

    test('Scenario F: Password Confirmation Mismatch', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill('abcderfghi')

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Confirm password must match Password/i)).toBeVisible();

    });

    test('Scenario F: Leaving empty Password Confirmation Field', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Confirm password must match Password/i)).toBeVisible();

    });

    test('Scenario G: Too Short Password Length less than 8 characters', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill('123456')
        await page.getByLabel(/confirm password/i).fill('123456')
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

});
