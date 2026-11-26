import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import { AuthContext } from "@/store/AuthProvider";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const renderComponent = (mockUpdateToken = vi.fn()) => {
    render(
        <AuthContext.Provider value={{ updateToken: mockUpdateToken, accessToken: null }}>
            <MemoryRouter initialEntries={["/register"]}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/register" element={<SignUp />} />
                </Routes>
                <Toaster />
            </MemoryRouter>
        </AuthContext.Provider>
    );

    return {
        mockUpdateToken,
        get firstName() { return screen.getByLabelText(/^First Name$/i) },
        get lastName() { return screen.getByLabelText(/^Last Name$/i) },
        get emailInput() { return screen.getByLabelText(/^Email$/i) },
        get passwordInput() { return screen.getByLabelText(/^Password$/i) },
        get CpasswordInput() { return screen.getByLabelText(/^Confirm Password$/i) },
        get submitButton() { return screen.getByRole('button', /^Register$/i) }
    }
};

describe("Registration form validation and account creation", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("renders the registration form and its primary fields", () => {
        const elements = renderComponent();

        expect(screen.getByRole('heading', { name: /Create Your Account/i })).toBeInTheDocument();

        expect(elements.firstName).toBeInTheDocument();
        expect(elements.lastName).toBeInTheDocument();
        expect(elements.emailInput).toBeInTheDocument();
        expect(elements.passwordInput).toBeInTheDocument();
        expect(elements.CpasswordInput).toBeInTheDocument();
        expect(elements.submitButton).toBeInTheDocument();
    });

    it("creates an account and stores the returned access token", async () => {
        const mockUpdateToken = vi.fn();
        const fakeJwt = "mock.access.token.jwt"
        const user = userEvent.setup();

        const elements = renderComponent(mockUpdateToken);

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "123456789")
        await user.type(elements.CpasswordInput, "123456789")

        await user.click(elements.submitButton);
        expect(elements.submitButton).toBeDisabled();

        await waitFor(() => {
            expect(mockUpdateToken).toHaveBeenCalledWith(fakeJwt);
        }, { timeout: 5000 });

        expect(await screen.findByText(/Amir Shaikh Account Created Successfully!/i)).toBeInTheDocument()

    });

    it("requires a first name that meets the minimum length", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "a")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "1234567")
        await user.type(elements.CpasswordInput, "1234567")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/First Name is Required/i)).toBeInTheDocument();
        expect(elements.submitButton).toBeEnabled();
    });

    it("rejects a name longer than 15 characters", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir shaikh 1234567")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "1234567")
        await user.type(elements.CpasswordInput, "1234567")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Name cannot exceed 15 characters/i)).toBeInTheDocument();
        expect(elements.submitButton).toBeEnabled();
    });

    it("requires a password of at least eight characters", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "1234567")
        await user.type(elements.CpasswordInput, "1234567")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Password must be atleast 8 characters long/i)).toBeInTheDocument();
    });

    it("requires the password confirmation to match the password", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "123456789")
        await user.type(elements.CpasswordInput, "12345678")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Confirm password must match Password/i)).toBeInTheDocument();
        expect(elements.submitButton).toBeEnabled();
    });

    it("rejects an invalid email address", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123gmail.com")
        await user.type(elements.passwordInput, "123456789")
        await user.type(elements.CpasswordInput, "123456789")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Please enter a Valid Email/i)).toBeInTheDocument()
        expect(elements.submitButton).toBeEnabled();
    });

    it("shows an error when the email address is already registered", async () => {
        const mockUpdateToken = vi.fn();
        const fakeJwt = "mock.access.token.jwt"
        const user = userEvent.setup();

        const elements = renderComponent(mockUpdateToken);

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "123456789")
        await user.type(elements.CpasswordInput, "123456789")

        await user.click(elements.submitButton);
        expect(elements.submitButton).toBeDisabled();

        await waitFor(() => {
            expect(mockUpdateToken).toHaveBeenCalledWith(fakeJwt);
        }, { timeout: 5000 });

        cleanup();
        const dupElements = renderComponent();

        await user.type(dupElements.firstName, "Amir")
        await user.type(dupElements.lastName, "shaikh")
        await user.type(dupElements.emailInput, "shaikh123@gmail.com")
        await user.type(dupElements.passwordInput, "123456789")
        await user.type(dupElements.CpasswordInput, "123456789")

        await user.click(dupElements.submitButton);
        expect(await screen.findByText(/User with this email already exists/i)).toBeInTheDocument();
        expect(dupElements.submitButton).toBeEnabled();

    });

    it("navigates to login when the login link is selected", async () => {
        const user = userEvent.setup();
        renderComponent();

        expect(screen.getByRole("heading", { name: /Create Your Account/i })).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: /Login/i }))

        expect(screen.getByRole("heading", { name: /Log in/i })).toBeInTheDocument();

    });

});

