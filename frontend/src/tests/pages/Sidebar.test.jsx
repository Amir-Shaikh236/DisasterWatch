import AppSidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Alerts from "@/pages/Alerts";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import Setting from "@/pages/Setting";
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
            <Setting />
            <Dashboard />
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

    it('Should redirect the user to the Alert Page', async () => {
        const user = userEvent.setup()
        renderComponent()

        const alertPage = screen.getByRole('link', { name: /Alerts/i })
        expect(alertPage).toBeInTheDocument()

        await user.click(alertPage)

        expect(await screen.findByRole('heading', { name: /^alerts$/i })).toBeInTheDocument();
        expect(alertPage).toHaveAttribute('href', '/alerts')

        expect(alertPage).toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Dashboard/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /My Reports/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Setting/i })).not.toHaveAttribute('data-active')
    });

})