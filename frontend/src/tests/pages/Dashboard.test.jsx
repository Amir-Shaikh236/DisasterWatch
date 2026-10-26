import Dashboard from "@/pages/Dashboard"
import { useUser } from "@/store/useUser"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

const renderComponent = () => render(
    <MemoryRouter>
        <Dashboard />
        <Toaster />
    </MemoryRouter>
)

describe("Setting Presentation Layout and Actions verification Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useUser.setState({
            user: {
                id: "usr_123",
                email: "amir.shaikh@disasterwatch.io",
                notification: false,
            },
            loading: false,
        });
    });

    it("Should display the primary typography labels and interactive fields clearly on Dashboard", () => {
        renderComponent();

        expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /critical alert near you/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /image analyzer/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument()

        expect(screen.getByRole('link', { name: /view Details/i })).toBeInTheDocument()

    });

});


