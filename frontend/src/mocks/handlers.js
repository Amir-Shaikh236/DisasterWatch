import { http, HttpResponse } from 'msw'

const loginAttempts = new Map();
const registeredEmails = new Set();
const LOGIN_ATTEMPT_LIMIT = 10;

export const resetLoginAttempts = () => {
    loginAttempts.clear();
    registeredEmails.clear();
};

export const handlers = [

    http.post(`*/api/auth/register`, async ({ request }) => {
        const { firstName, lastName, email, password } = await request.json();

        if (!firstName || !lastName || !email || !password) {
            return HttpResponse.json(
                { status: "fail", message: "Please provide all required fields" },
                { status: 400 }
            );
        }


        if (registeredEmails.has(email)) {
            return HttpResponse.json(
                { status: "fail", message: "User with this email already exists" },
                { status: 403 }
            );
        }

        registeredEmails.add(email);

        return HttpResponse.json({
            status: "success",
            message: `${firstName} ${lastName} Account created Successfully`,
            user: { id: "usr_456", email, firstName, lastName },
            accessToken: "mock.access.token.jwt"
        }, {
            status: 201,
        });
    }),

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


    http.post(`*/api/ai/analyze-image`, async ({ request }) => {
        const formData = await request.formData();
        const image = formData.get("image");

        if (!image || typeof image === "string" || typeof image.type !== "string") {
            return HttpResponse.json(
                { status: "fail", message: "Image in base64 is Required" },
                { status: 400 }
            );
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        return HttpResponse.json({
            status: "success",
            analysis: {
                isRealPhoto: true,
                isDisaster: true,
                disasterType: "Flood",
                confidence: 0.92,
                confidenceReasoning: "The image contains clear visual evidence of flooding.",
                severity: "high",
                location: null,
                areaType: "urban",
                estimatedDate: null,
                description: "Standing water is visible across an urban area.",
                keyIndicators: ["Flooded roadway", "Standing water"],
                potentialImpact: "Flooding may restrict travel and damage nearby property.",
                recommendedActions: [
                    "Avoid flooded roads",
                    "Follow guidance from local emergency services"
                ],
                misinformationScore: 0.02,
                flags: []
            }
        }, {
            status: 200
        });
    })
];