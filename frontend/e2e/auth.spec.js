/* eslint-disable */

import { expect, test } from "@playwright/test";
const backendBaseURL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

test.describe.serial('Login form and authentication', () => {

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
            email: `e2e.login.${test.info().project.name}.${test.info().workerIndex}.${Date.now()}@disasterwatch.io`,
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

    test('authenticates valid credentials and opens the dashboard', async ({ page }) => {

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

    test('shows an error for incorrect credentials and allows another attempt', async ({ page }) => {

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

    test('rejects an email address with an invalid format', async ({ page }) => {

        await page.getByLabel(/email/i).fill('wrong.userdisasterWatch.io')
        await page.getByLabel(/password/i).fill('InvalidPassowrd123!')

        const submitBtn = page.getByRole('button', { name: 'Login', exact: true });
        await submitBtn.click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
        await expect(submitBtn).toBeEnabled();
    });

    test('requires an email address before login', async ({ page }) => {
        await page.getByLabel(/email/i).fill('')
        await page.getByLabel(/password/i).fill('SecurePassword123!')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Invalid Email Address/i)).toBeVisible();
    });

    test('requires a password with at least eight characters', async ({ page }) => {
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByLabel(/password/i).fill('secu')
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('requires a password before login', async ({ page }) => {
        await page.getByLabel(/email/i).fill(testUser.email)
        await page.getByRole('button', { name: /login/i }).click()

        await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('opens the registration page from the login form', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: /Log in/i })
        expect(loginHeader).toBeVisible();

        const registerLing = page.getByRole('link', { name: /register/i })
        await registerLing.click()
        expect(loginHeader).not.toBeVisible();

        await expect(page.getByRole('heading', { name: /Create Your Account/i })).toBeVisible()

    });

    test('disables the login button while the request is pending', async ({ page }) => {

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')

        await loginBtn.click()
        expect(loginBtn).toHaveText(/Logging in/i)
        await expect(loginBtn).toBeDisabled();
        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });
    });

    test('submits only one login request when the button is double-clicked', async ({ page }) => {

        let loginRequests = 0;

        page.on('request', request => {
            if (request.method() === 'POST' && request.url().includes('/api/auth/login')) loginRequests++;
        });

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')

        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login')
        );
        await loginBtn.dblclick()
        const loginResponse = await responsePromise;
        expect(loginResponse.status()).toBe(200);
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
        expect(loginRequests).toBe(1);

    });

    test('displays a server error and re-enables the login button', async ({ page }) => {
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

    test('sends the entered email and password to the login endpoint', async ({ page }) => {

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

    test('keeps the user authenticated after reloading the dashboard', async ({ page }) => {

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const loginBtn = page.locator('form button[type="submit"]')
        await loginBtn.click();

        await expect(page.getByText(/Logged in successfully/i)).toBeVisible({ timeout: 15000 });

        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

        await expect(page.getByRole('link', { name: /DisasterWatch/i })).toBeVisible();

        await page.reload();
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });

    });

});

test.describe.serial('Registration form and account creation', () => {

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
            email: `e2e.registration.${test.info().project.name}.${test.info().workerIndex}.${Date.now()}@disasterwatch.io`,
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

    test('creates an account and opens the dashboard', async ({ page }) => {

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

    test('requires a first name', async ({ page }) => {

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();

    });

    test('rejects a first name shorter than the minimum length', async ({ page }) => {

        await page.getByLabel('First Name').fill('Ami')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('rejects a first name longer than the maximum length', async ({ page }) => {

        await page.getByLabel('First Name').fill('12345678901234587')
        await page.getByLabel('Last Name').fill('Amir')
        await expect(page.getByText(/First Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('requires a last name', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await page.getByLabel(/confirm password/i).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible({ timeout: 15000 });

    });

    test('rejects a last name shorter than the minimum length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('Ami')
        await page.getByLabel(/email/i).fill(testUser.email)
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();

    });

    test('rejects a last name longer than the maximum length', async ({ page }) => {

        await page.getByLabel('Last Name').fill('123456789012345891')
        await page.getByLabel('First Name').fill('Amir')
        await expect(page.getByText(/Last Name cannot exceed 15 characters/i)).toBeVisible();

    });

    test('reports missing values for all required registration fields', async ({ page }) => {

        const registerBtn = page.locator('form button[type="submit"]')
        // press button
        await registerBtn.click()
        await expect(page.getByText(/First Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Last Name is Required/i)).toBeVisible();
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

    test('rejects an email address with an invalid format', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill('amir21.com')

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)
        await expect(page.getByText(/Please enter a Valid Email/i)).toBeVisible();

    });

    test('prevents account creation with an already registered email', async ({ page, request }) => {

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

    test('requires the password confirmation to match the password', async ({ page }) => {

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

    test('requires a password confirmation', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill(testUser.password)

        const registerBtn = page.locator('form button[type="submit"]')

        // press button
        await registerBtn.click()
        await expect(page.getByText(/Confirm password must match Password/i)).toBeVisible();

    });

    test('rejects a password shorter than eight characters', async ({ page }) => {

        await page.getByLabel('First Name').fill(testUser.firstName)

        await page.getByLabel('Last Name').fill(testUser.lastName)

        await page.getByLabel(/email/i).fill(testUser.email)

        await page.getByLabel('Password', { exact: true }).fill('123456')
        await page.getByLabel(/confirm password/i).fill('123456')
        await expect(page.getByText(/Password must be atleast 8 characters long/i)).toBeVisible();

    });

    test('disables the registration button while the request is pending', async ({ page }) => {

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

    test('submits only one registration request when the button is double-clicked', async ({ page }) => {

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

    test('sends the entered registration fields to the registration endpoint', async ({ page }) => {

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

    test('displays a server error and re-enables the registration button', async ({ page }) => {
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

    test('opens the login page from the registration form', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: /create your account/i })
        expect(loginHeader).toBeVisible();

        const registerLing = page.getByRole('link', { name: /Login/i })
        await registerLing.click()
        expect(loginHeader).not.toBeVisible();

        await expect(page.getByRole('heading', { name: /Log in/i })).toBeVisible()

    });

});

test.describe.serial('Settings, location sharing, and access control', () => {

    let settingsAccessToken;

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
            email: `e2e.settings.${test.info().project.name}.${test.info().workerIndex}.${Date.now()}@disasterwatch.io`,
            password: 'SecurePassword123!',
            firstName: 'Admin',
            lastName: 'User',
        };

        await clearAll(request);

        const registerResponse = await request.post(`${backendBaseURL}/api/auth/register`, {
            data: {
                firstName: testUser.firstName,
                lastName: testUser.lastName,
                email: testUser.email,
                password: testUser.password
            },
            failOnStatusCode: false,
        });

        if (![201, 403].includes(registerResponse.status())) {
            throw new Error(`Failed to create E2E test user: ${registerResponse.status()} ${await registerResponse.text()}`);
        }

        settingsAccessToken = (await registerResponse.json()).accessToken;
        const updateResponse = await request.post(`${backendBaseURL}/api/auth/user/update`, {
            data: {
                notification: true,
                location: {
                    type: 'Point',
                    coordinates: [72.8777, 19.076],
                    address: 'Mumbai, India',
                },
                token: 'e2e-fcm-token',
            },
            headers: { Authorization: `Bearer ${settingsAccessToken}` },
            failOnStatusCode: false,
        });

        if (updateResponse.status() !== 200) {
            throw new Error(`Failed to enable settings E2E notifications: ${updateResponse.status()} ${await updateResponse.text()}`);
        }
    });

    test.afterAll(async ({ request }) => {
        await clearAll(request)
    });

    test.beforeEach(async ({ page, request }, testInfo) => {
        const shouldStartEnabled = !testInfo.title.startsWith('Enables notification sharing');
        const resetResponse = await request.post(`${backendBaseURL}/api/auth/user/update`, {
            data: shouldStartEnabled
                ? {
                    notification: true,
                    location: {
                        type: 'Point',
                        coordinates: [72.8777, 19.076],
                        address: 'Mumbai, India',
                    },
                    token: 'e2e-fcm-token',
                }
                : { notification: false, location: null, token: null },
            headers: { Authorization: `Bearer ${settingsAccessToken}` },
            failOnStatusCode: false,
        });

        if (resetResponse.status() !== 200) {
            throw new Error(`Failed to reset settings E2E notifications: ${resetResponse.status()} ${await resetResponse.text()}`);
        }

        await page.context().clearCookies();
        await page.goto('/');
        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel('Password', { exact: true }).fill(testUser.password);
        const loginResponsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login')
        );
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        const loginResponse = await loginResponsePromise;
        if (loginResponse.status() !== 200) {
            throw new Error(`Settings login failed: ${loginResponse.status()} ${await loginResponse.text()}`);
        }
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    });

    test('renders the settings page and its interactive controls', async ({ page }) => {
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

    test('disables notification sharing when location sharing is turned off', async ({ page }) => {
        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();
        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()

        const notificationSwitch = page.getByRole('switch')
        await expect(notificationSwitch).toBeVisible()

        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible()
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')

        await notificationSwitch.click()

        await expect(page.getByText(/Sharing Disabled/i)).toBeVisible()
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')
    });

    test('enables notification sharing when location sharing is turned on', async ({ page, context }) => {
        await context.grantPermissions(['geolocation', 'notifications'], {
            origin: 'http://localhost:5173'
        });

        await context.setGeolocation({
            latitude: 19.076,
            longitude: 72.8777
        });

        const testOverrides = {
            notificationToken: 'e2e-fcm-token',
            gpsLocation: {
                latitude: 19.076,
                longitude: 72.8777,
                address: 'Mumbai, India',
            },
        };
        await page.evaluate(overrides => {
            window.__DISASTERWATCH_E2E__ = overrides;
        }, testOverrides);

        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();
        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()

        const notificationSwitch = page.getByRole('switch')
        await expect(notificationSwitch).toBeVisible()

        await expect(notificationSwitch).toHaveAttribute('aria-checked', /^(true|false)$/)
        if (await notificationSwitch.getAttribute('aria-checked') === 'true') {
            await notificationSwitch.click()
            await expect(page.getByText(/Sharing Disabled/i)).toBeVisible({ timeout: 15000 })
            await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')
        }

        await notificationSwitch.click()
        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible({ timeout: 15000 })
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')
    });

    test('persists the location-sharing preference after a page reload', async ({ page, context }) => {
        await context.grantPermissions(['geolocation', 'notifications'], {
            origin: 'http://localhost:5173'
        });

        await context.setGeolocation({
            latitude: 19.076,
            longitude: 72.8777
        });

        const testOverrides = {
            notificationToken: 'e2e-fcm-token',
            gpsLocation: {
                latitude: 19.076,
                longitude: 72.8777,
                address: 'Mumbai, India',
            },
        };
        await page.evaluate(overrides => {
            window.__DISASTERWATCH_E2E__ = overrides;
        }, testOverrides);

        await page.addInitScript(overrides => {
            window.__DISASTERWATCH_E2E__ = overrides;
        }, testOverrides);


        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();
        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()

        const notificationSwitch = page.getByRole('switch')
        await expect(notificationSwitch).toBeVisible()

        await expect(notificationSwitch).toHaveAttribute('aria-checked', /^(true|false)$/)
        if (await notificationSwitch.getAttribute('aria-checked') === 'true') {
            await notificationSwitch.click()
            await expect(page.getByText(/Sharing Disabled/i)).toBeVisible({ timeout: 15000 })
            await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')

            await page.reload();
            await expect(page.getByText(/Sharing Disabled/i)).toBeVisible({ timeout: 15000 })
            await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')
        }

        await notificationSwitch.click()
        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible({ timeout: 15000 })
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')

        await page.reload();
        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible({ timeout: 15000 })
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')
    });

    test('sends the current coordinates when location sharing is enabled', async ({ page, context }) => {

        const requestPromise = page.waitForRequest(request =>
            request.method() === 'POST' &&
            request.url().includes('/api/auth/user/update') &&
            request.postDataJSON()?.notification === true
        );

        await context.grantPermissions(['geolocation', 'notifications'], {
            origin: 'http://localhost:5173'
        });

        await context.setGeolocation({
            latitude: 24.076,
            longitude: 84.8777
        });

        await page.evaluate(() => {
            window.__DISASTERWATCH_E2E__ = {
                notificationToken: 'e2e-fcm-token',
                gpsLocation: {
                    latitude: 24.076,
                    longitude: 84.8777,
                    address: 'Mumbai, India',
                },
            };
        });

        await page.route('**/api/auth/user/update', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                },
                body: JSON.stringify({
                    status: 'success',
                    notification: true,
                }),
            });
        });

        const settingLink = page.getByRole('link', { name: 'Setting' })
        await expect(settingLink).toBeVisible();
        await settingLink.click()

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()

        const notificationSwitch = page.getByRole('switch')
        await expect(notificationSwitch).toBeVisible()

        await expect(notificationSwitch).toHaveAttribute('aria-checked', /^(true|false)$/)
        if (await notificationSwitch.getAttribute('aria-checked') === 'true') {
            await notificationSwitch.click()
            await expect(page.getByText(/Sharing Disabled/i)).toBeVisible({ timeout: 15000 })
            await expect(notificationSwitch).toHaveAttribute('aria-checked', 'false')
        }

        await notificationSwitch.click()
        await expect(notificationSwitch).toHaveAttribute('aria-checked', 'true')
        await expect(page.getByText(/Sharing Enabled/i)).toBeVisible({ timeout: 15000 })

        const postData = await requestPromise;
        const { token, notification, location } = postData.postDataJSON();

        expect(token).toBe('e2e-fcm-token');
        expect(notification).toBe(true);
        expect(location).toEqual({
            type: 'Point',
            coordinates: [84.8777, 24.076],
            address: 'Mumbai, India',
        });

    });

    test('allows an authenticated user to access settings and redirects unauthenticated users', async ({ page }) => {
        page.goto('/setting')

        await expect(page).toHaveURL(/\/setting$/, { timeout: 15000 });
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible()
        await expect(page.getByRole('switch')).toBeVisible()

        const MenuBtn = page.getByText(/Admin User/i)
        await MenuBtn.click();

        await expect(page.getByText(/Log Out/i)).toBeVisible();

        await page.getByText(/Log Out/i).click();

        // User have to Login Again to get access of the Page

        page.goto('/setting')

        await expect(page).not.toHaveURL(/\/setting$/)
        await expect(page.getByRole('heading', { name: /Settings/i })).not.toBeVisible()
    });

});

test.describe.serial('Logout Functionality, Verification and Session Termination', () => {
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
            email: `e2e.login.${test.info().project.name}.${test.info().workerIndex}.${Date.now()}@disasterwatch.io`,
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
        const loginResponsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login')
        );

        await page.context().clearCookies();
        await page.goto('/');

        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel('Password', { exact: true }).fill(testUser.password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        const loginResponse = await loginResponsePromise;
        if (loginResponse.status() !== 200) {
            throw new Error(`Settings login failed: ${loginResponse.status()} ${await loginResponse.text()}`);
        }

        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    });

});
