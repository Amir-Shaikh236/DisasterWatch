
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { AuthContext } from "@/store/AuthProvider"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Login from "@/pages/Login"
import { Toaster } from "sonner"

const renderLoginComponent = (mockUpdateToken = vi.fn()) => {
    return render(
        <AuthContext.Provider value={{ updateToken: mockUpdateToken, accessToken: null }}>
            <BrowserRouter>
                <Login />
                <Toaster />
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe("Login Presentation Layout & Action Verification Suite", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    })

    it("should display the primary typography labels and interactive fields clearly on mount", () => {
        renderLoginComponent();

        // 1. Assert semantic heading text exists in the document flow
        expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();

        // 2. Confirm fields are accessible via standard input labels
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("should process valid user credentials smoothly and trigger the state context method", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();
        const fakeJwt = "mock.access.token.jwt"

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ token: fakeJwt })
        });

        renderLoginComponent(mockUpdateToken);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole("button", { name: /login/i });

        // Simulate a real user typing credentials into the form inputs
        await user.type(emailInput, "amir.shaikh@disasterwatch.io");
        await user.type(passwordInput, "SecurePassword123!");

        // Execute form submit trigger
        await user.click(submitButton);

        // Wait for the throttled request to complete and ensure the auth callback is invoked
        await waitFor(() => {
            expect(mockUpdateToken).toHaveBeenCalledTimes(1);
        }, { timeout: 5000 });

        expect(mockUpdateToken).toHaveBeenCalledWith(fakeJwt);
    });

    it("should show the 401 error for incorrect email or password", async () => {
        const mockUpdateToken = vi.fn();
        const user = userEvent.setup();

        renderLoginComponent(mockUpdateToken);

        await user.type(screen.getByLabelText(/email/i), "shaikh@disasterwatch.io");
        await user.type(screen.getByLabelText(/password/i), "shaikh@disasterwatch.io");
        await user.click(screen.getByRole("button", { name: /login/i }));

        expect(await screen.findByText(/Incorrect Email or Password/i)).toBeInTheDocument();
        expect(mockUpdateToken).not.toHaveBeenCalled();

    })
});
