import AppSidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import { AuthContext } from "@/store/AuthProvider";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const renderComponent = () => render(
    <AuthContext.Provider value={{ clearSession: vi.fn() }} >
        <MemoryRouter>
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <Alerts />
            <Reports />
        </MemoryRouter>
    </AuthContext.Provider>
)

describe("Setting Presentation Layout of Dashboard and Actions verification Suite", () => {

    it("Should display the primary typography labels and interactive fields clearly on Dashboard", () => {
        renderComponent();

        expect(screen.getByRole('link', { name: /disasterWatch/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Alerts/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /My Reports/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Setting/i })).toBeInTheDocument()

    });
})