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

describe("Register Presentation Layout and Action verification Suite", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("Should display the primary typography labels and interactive fields clearly on mount", () => {
        const elements = renderComponent();

        expect(screen.getByRole('heading', { name: /Create Your Account/i })).toBeInTheDocument();

        expect(elements.firstName).toBeInTheDocument();
        expect(elements.lastName).toBeInTheDocument();
        expect(elements.emailInput).toBeInTheDocument();
        expect(elements.passwordInput).toBeInTheDocument();
        expect(elements.CpasswordInput).toBeInTheDocument();
        expect(elements.submitButton).toBeInTheDocument();
    });

    it("Should Register User Successfully with accessToken", async () => {
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

    });

    it("Should Return User with this email already exists", async () => {
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

    it("Should Move to Login Page After Clicking on Register", async () => {
        const user = userEvent.setup();
        renderComponent();

        expect(screen.getByRole("heading", { name: /Create Your Account/i })).toBeInTheDocument();
        await user.click(screen.getByRole('link', { name: /Login/i }))

        expect(screen.getByRole("heading", { name: /Log in/i })).toBeInTheDocument();

    });

    it("Should Reject and Show atleast 8 characters for password", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123@gmail.com")
        await user.type(elements.passwordInput, "1234567")
        await user.type(elements.CpasswordInput, "1234567")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Password must be atleast 8 characters long/i));
    });

    it("Should Reject and Show Invalid Email Format....", async () => {
        const user = userEvent.setup();

        const elements = renderComponent();

        await user.type(elements.firstName, "Amir")
        await user.type(elements.lastName, "shaikh")
        await user.type(elements.emailInput, "shaikh123gmail.com")
        await user.type(elements.passwordInput, "123456789")
        await user.type(elements.CpasswordInput, "123456789")

        await user.click(elements.submitButton)
        expect(await screen.findByText(/Please enter a Valid Email/i));
    });

})
