import { http, HttpResponse } from 'msw'

// const BASE_URL = import.meta.env.VITE_API_URL || '';

export const handlers = [

    http.post(`*/api/auth/login`, async ({ request }) => {
        const { email, password } = await request.json();

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
            { status: "fail", message: "invalid Credentials" },
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