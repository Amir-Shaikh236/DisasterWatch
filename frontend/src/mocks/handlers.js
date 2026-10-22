import { http, HttpResponse } from 'msw'

const loginAttempts = new Map();
const LOGIN_ATTEMPT_LIMIT = 10;

export const resetLoginAttempts = () => {
    loginAttempts.clear();
};

export const handlers = [

    http.post(`*/api/auth/login`, async ({ request }) => {
        const { email, password } = await request.json();
        const attempts = loginAttempts.get(email) || 0;

        if (attempts >= LOGIN_ATTEMPT_LIMIT) {
            return HttpResponse.json(
                { status: "fail", message: "Too many login attempts, Please try again after 15mins" },
                { status: 429 }
            );
        }

        loginAttempts.set(email, attempts + 1);

        if (email === "amir.shaikh@disasterwatch.io" && password === "SecurePassword123!") {
            return HttpResponse.json({
                status: "success",
                user: { id: "usr_123", email, firstName: "Admin", lastName: "User" },
                accessToken: "mock.access.token.jwt"
            }, {
                status: 200,
            });
        }

        return HttpResponse.json(
            { status: "fail", message: "Incorrect Email or Password" },
            { status: 401 }
        );
    }),

    http.post(`*/api/auth/refresh`, ({ cookies }) => {

        const clientRefreshToken = cookies.refreshToken;

        if (!clientRefreshToken) {
            return HttpResponse.json(
                { status: 'fail', message: "Authentication token missing" },
                { status: 401 }
            );
        }

        return HttpResponse.json(
            { accessToken: "new.mock.access.token.jwt" },
            { status: 200 }
        );
    }),
];