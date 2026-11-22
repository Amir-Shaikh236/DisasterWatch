/* eslint-disable */

import { expect, test } from "@playwright/test";
const backendBaseURL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

test.describe.serial('Login Authentication Flow', () => {

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

    test('logs in successfully and redirects to the dashboard', async ({ page }) => {

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

    test('rejects incorrect credentials and keeps the login button enabled', async ({ page }) => {

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

    test('shows a validation error for an invalid email format', async ({ page }) => {

        await page.getByLabel(/email/i).fill('wrong.userdisasterWatch.io')
        await page.getByLabel(/password/i).fill('InvalidPassowrd123!')

        const submitBtn = page.getByRole('button', { name: 'Login', exact: true });
        await submitBtn.click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
        await expect(submitBtn).toBeEnabled();
    });

    test('shows a validation error when the email field is empty', async ({ page }) => {
        await page.getByLabel(/email/i).fill('')
        await page.getByLabel(/password/i).fill('SecurePassword123!')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
    });

    test('shows a validation error for a password shorter than eight (8) characters', async ({ page }) => {
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByLabel(/password/i).fill('secu')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('shows a validation error when the password is empty', async ({ page }) => {
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('navigates from the login page to the registration page', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: /Log in/i })
        expect(loginHeader).toBeVisible();

        const registerLing = page.getByRole('link', { name: /register/i })
        await registerLing.click()
        expect(loginHeader).not.toBeVisible();

        await expect(page.getByRole('heading', { name: /Create Your Account/i })).toBeVisible()

    });

    test('disables the login button while authentication is processing', async ({ page }) => {

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')

        await loginBtn.click()
        expect(loginBtn).toHaveText(/Logging in/i)
        await expect(loginBtn).toBeDisabled();
        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('sends only one login request after a double click', async ({ page }) => {

        let loginRequests = 0;

        page.on('request', request => {
            if (request.method() === 'POST' && request.url().includes('/api/auth/login')) loginRequests++;
        });

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')

        // press button
        await loginBtn.dblclick()
        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });
        expect(loginRequests).toBe(1);

    });

    test('shows a server error and re-enables the login button', async ({ page }) => {
        await page.route('**/api/auth/login', async route => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Login service is temporarily unavailable',
                }),
            });
        });

        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login')
        );

        await loginBtn.click()
        await expect(loginBtn).toBeDisabled();

        const response = await responsePromise;
        expect(response.status()).toBe(500);

        await expect(page.getByText(/Login service is temporarily unavailable/i)).toBeVisible({ timeout: 5000 });
        await expect(loginBtn).toBeEnabled();
    });

    test('sends the expected email and password in the login request', async ({ page }) => {

        const requestPromise = page.waitForRequest(request =>
            request.method() === 'POST' && request.url().includes('/api/auth/login')
        );

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')

        // press button
        await loginBtn.click();
        const requestData = await requestPromise;
        const actualPayload = requestData.postDataJSON();

        expect(actualPayload).toEqual({ email: testUser.email, password: testUser.password })
    });

    test('preserves a valid login session after reloading the dashboard', async ({ page }) => {

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')
        await loginBtn.click();

        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });

        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

        await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();

        const activeCookies = await page.evaluate(() => document.cookie);
        expect(activeCookies).not.toContain('refreshToken=');

        await page.reload();
        await expect(page).toHaveURL(/\/dashboard$/);

    });

});

test.describe.serial('Registration Authentication Flow', () => {

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

    test('registers successfully and redirects to the dashboard', async ({ page }) => {

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

    test('shows an error when the first name is empty', async ({ page }) => {

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();

    });

    test('shows an error when the first name is below the minimum length', async ({ page }) => {

        await page.getByLabel('First Name').fill('Ami')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('shows an error when the first name exceeds the maximum length', async ({ page }) => {

        await page.getByLabel('First Name').fill('12345678901234587')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('shows an error when the last name is empty', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('shows an error when the last name is below the minimum length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('Ami')
        await page.getByLabel(/email/i).fill(testUser.email)
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();

    });

    test('shows an error when the last name exceeds the maximum length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('123456789012345891')
        await page.getByLabel('First Name').fill('Amir')
        await expect(page.getByText(/Last Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('shows validation errors for all empty required fields', async ({ page }) => {

        const registerBtn = page.locator('form button[type="submit"]')
        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

    test('shows a validation error for an invalid registration email', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill('amir21.com')

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();

    });

    test('rejects registration with an existing email address', async ({ page, request }) => {

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

    test('shows an error when password confirmation does not match', async ({ page }) => {

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

    test('shows an error when password confirmation is empty', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Confirm password must match Password/i)).toBeVisible();

    });

    test('shows a validation error for a password shorter than eight characters', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill('123456')
        await page.getByLabel(/confirm password/i).fill('123456')
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

    test('disables the registration button while submission is processing', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(`processing.${Date.now()}@disasterwatch.io`)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(registerBtn).toBeDisabled();
        await expect(page.getByText(/creating your Account/i)).toBeVisible();
        await expect(page.getByText(/Admin User account created successfully!/i)).toBeVisible({ timeout: 15000 });
    });

    test('sends only one registration request after a double click', async ({ page }) => {

        let registrationRequests = 0;

        page.on('request', request => {
            if (
                request.method() === 'POST' &&
                request.url().includes('/api/auth/register')
            ) {
                registrationRequests++;
            }
        });

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(`testing${Date.now()}@disasterwatch.io`)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.dblclick()
        await expect(page.getByText(/Admin User account created successfully/i)).toBeVisible({ timeout: 15000 });

        expect(registrationRequests).toBe(1);
    });

    test('sends the expected registration fields in the request payload', async ({ page }) => {

        const requestPromise = page.waitForRequest(request =>
            request.method() === 'POST' && request.url().includes('/api/auth/register')
        );

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(`skamir2410@disasterwatch.io`)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click();
        const requestData = await requestPromise;
        const actualPayload = requestData.postDataJSON();

        expect(actualPayload).toEqual({ ...testUser, email: 'skamir2410@disasterwatch.io' })
        expect(actualPayload).not.toHaveProperty('confirmPassword');
    });

    test('shows a server error and re-enables the registration button', async ({ page }) => {
        await page.route('**/api/auth/register', async route => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    status: 'error',
                    message: 'Registration service is temporarily unavailable',
                }),
            });
        });

        await page.getByLabel('First Name').fill(testUser.firstName)
        await page.getByLabel('Last Name').fill(testUser.lastName)
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/register')
        );

        await registerBtn.click()
        await expect(registerBtn).toBeDisabled();

        const response = await responsePromise;
        expect(response.status()).toBe(500);

        await expect(page.getByText(/Registration service is temporarily unavailable/i)).toBeVisible({ timeout: 5000 });
        await expect(registerBtn).toBeEnabled();
    });

    test('navigates from the registration page to the login page', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: /create your account/i })
        expect(loginHeader).toBeVisible();

        const registerLing = page.getByRole('link', { name: /Login/i })
        await registerLing.click()
        expect(loginHeader).not.toBeVisible();

        await expect(page.getByRole('heading', { name: /Log in/i })).toBeVisible()

    });

});



test.describe.serial('Setting and User Data Update Testing', () => {

    let testUser;

    test.beforeAll(async ({ request }) => {
        testUser = {
            email: `e2e.settings.${test.info().project.name}.${test.info().workerIndex}@disasterwatch.io`,
            password: 'SecurePassword123!',
            firstName: 'Admin',
            lastName: 'User',
        };

        const registerResponse = await request.post(`${backendBaseURL}/api/auth/register`, {
            data: testUser,
            failOnStatusCode: false,
        });

        if (registerResponse.status() === 201) {
            const { accessToken } = await registerResponse.json();
            await request.post(`${backendBaseURL}/api/auth/user/update`, {
                data: {
                    notification: true,
                    location: {
                        type: 'Point',
                        coordinates: [72.8777, 19.076],
                        address: 'Mumbai, India',
                    },
                    token: 'e2e-fcm-token',
                },
                headers: { Authorization: `Bearer ${accessToken}` },
                failOnStatusCode: false,
            });
        }
    });

    test.afterAll(async ({ request }) => {
        const loginResponse = await request.post(`${backendBaseURL}/api/auth/login`, {
            data: { email: testUser.email, password: testUser.password },
            failOnStatusCode: false,
        });

        if (loginResponse.status() !== 200) return;

        const { accessToken } = await loginResponse.json();
        await request.post(`${backendBaseURL}/api/auth/user/delete`, {
            data: { email: testUser.email },
            headers: { Authorization: `Bearer ${accessToken}` },
            failOnStatusCode: false,
        });
    });

    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('/');
        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel('Password', { exact: true }).fill(testUser.password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    });

    test('Verifying Setting Component with all interactive fields', async ({ page }) => {
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

        await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();

        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()
        await expect(page.getByRole('switch')).toBeVisible()
    });

    test('Disables notification sharing with the location-sharing switch', async ({ page }) => {
        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();
        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()

        const notificationSwitch = page.getByRole('switch')
        await expect(notificationSwitch).toBeVisible()

        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')
        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible()

        await notificationSwitch.click()

        await expect(page.getByText(/Sharing Disabled/i)).toBeVisible()
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')
    });

})
