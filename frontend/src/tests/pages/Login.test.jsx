import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { AuthContext } from "@/store/AuthProvider"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Login from "@/pages/Login"
import SignUp from "@/pages/SignUp"
import { Toaster } from "sonner"

const renderLoginComponent = (mockUpdateToken = vi.fn()) => {
    return render(
        <AuthContext.Provider value={{ updateToken: mockUpdateToken, accessToken: null }}>
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<SignUp />} />
                </Routes>
                <Toaster />
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe("Login Presentation Layout & Action Verification Suite", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it("Should display the primary typography labels and interactive fields clearly on mount", () => {
        renderLoginComponent();

        // 1. Assert semantic heading text exists in the document flow
        expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();

        // 2. Confirm fields are accessible via standard input labels
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("Should process valid user credentials smoothly and trigger the state context method", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();
        const fakeJwt = "mock.access.token.jwt"

        renderLoginComponent(mockUpdateToken);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole("button", { name: /login/i });

        // Simulate a real user typing credentials into the form inputs
        await user.type(emailInput, "amir.shaikh@disasterwatch.io");
        await user.type(passwordInput, "SecurePassword123!");

        // Execute form submit trigger
        await user.click(submitButton);

        // Assert button is disabled while request is active
        expect(submitButton).toBeDisabled();

        // Attempt a second click to ensure double-submission is blocked
        await user.click(submitButton);

        // Wait for the throttled request to complete and ensure the auth callback is invoked
        await waitFor(() => {
            expect(mockUpdateToken).toHaveBeenCalledTimes(1);
        }, { timeout: 5000 });

        expect(mockUpdateToken).toHaveBeenCalledWith(fakeJwt);
    });

    it("Should show the 401 error for incorrect email or password", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();

        renderLoginComponent(mockUpdateToken);

        await user.type(screen.getByLabelText(/email/i), "shaikh@disasterwatch.io");
        await user.type(screen.getByLabelText(/password/i), "shaikh@disasterwatch.io");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText(/Incorrect Email or Password/i)).toBeInTheDocument();
        expect(mockUpdateToken).not.toHaveBeenCalled();

    });

    it("Should show the 400 error for Not Providing and using invalid format of email", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();

        renderLoginComponent(mockUpdateToken);
        await user.click(screen.getByRole("button", { name: /login/i }));
        await user.type(screen.getByLabelText(/password/i), "SecurePassword123!");
        expect(await screen.findByText(/Invalid Email Address/i)).toBeInTheDocument();
        expect(mockUpdateToken).not.toHaveBeenCalled();
    });

    it("Should show the 400 error for Not Providing or missing length of Password", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();

        renderLoginComponent(mockUpdateToken);
        await user.type(screen.getByLabelText(/email/i), "shaikh@disasterwatch.io");
        await user.type(screen.getByLabelText(/password/i), "Secur");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
        expect(mockUpdateToken).not.toHaveBeenCalled();
    });

    it('Should block login attempts after exceeding rate limit (Brute-Force Defence)', async () => {
        const user = userEvent.setup();
        renderLoginComponent();

        await user.type(screen.getByLabelText(/email/i), 'AmirShaikh@gmail.com')
        await user.type(screen.getByLabelText(/password/i), 'AmirShaikh@gmail.com')
        const submitBtn = screen.getByRole('button', { name: /Login/i })

        for (let i = 0; i < 10; i++) {
            await waitFor(() => {
                expect(submitBtn).toBeEnabled();
            })

            await user.click(submitBtn)
        }

        await waitFor(() => {
            expect(submitBtn).toBeEnabled();
        })
        await user.click(submitBtn)

        expect(await screen.findByText(/Too many login attempts, Please try again after 15mins/i)).toBeInTheDocument();
    }, 30000);

    it("Should Move to Registration Page After Clicking on Register", async () => {
        const user = userEvent.setup();
        renderLoginComponent();

        expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: /register/i }))

        expect(screen.getByRole("heading", { name: /Create Your Account/i })).toBeInTheDocument();

    });

});
