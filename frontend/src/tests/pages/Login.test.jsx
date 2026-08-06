
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrowserRouter } from "react-router-dom"
import { AuthContext } from "@/store/AuthProvider"
import { describe, it, expect, vi } from "vitest"
import Login from "@/pages/Login"

const renderLoginComponent = (mockUpdateToken = vi.fn()) => {
    return render(
        <AuthContext.Provider value={{ updateToken: mockUpdateToken, accessToken: null }}>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe("Login Presentation Layout & Action Verification Suite", () => {

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
            expect(mockUpdateToken).toHaveBeenCalledWith("mock.access.token.jwt");
        }, { timeout: 5000 });
    });
});

