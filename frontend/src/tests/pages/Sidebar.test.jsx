import AppSidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Alerts from "@/pages/Alerts";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import Setting from "@/pages/Setting";
import { AuthContext } from "@/store/AuthProvider";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Login from "@/pages/Login";
import { useUser } from "@/store/useUser";
import { Toaster } from "sonner";

const renderComponent = () => render(
    <AuthContext.Provider value={{ clearSession: vi.fn() }} >
        <MemoryRouter>
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            <Login />
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

    it('Should bring user to the Dashbaord (Defauld route) after clicking on logo', async () => {
        const user = userEvent.setup()
        renderComponent();

        const reportBtn = screen.getByRole('link', { name: /My Reports/i })
        expect(reportBtn).toBeInTheDocument()
        await user.click(reportBtn)

        expect(await screen.findByRole('heading', { name: /Your Reports/i }))
        expect(reportBtn).toHaveAttribute('data-active')

        expect(screen.getByRole('link', { name: /Dashboard/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Alert/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Setting/i })).not.toHaveAttribute('data-active')

        const LogoBtn = screen.getByRole('link', { name: /disasterWatch/i })
        expect(LogoBtn).toBeInTheDocument();
        await user.click(LogoBtn)


        expect(await screen.findByRole('heading', { name: /Dashboard/i })).toBeInTheDocument()
        expect(LogoBtn).toHaveAttribute('href', '/dashboard')

        expect(reportBtn).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Alert/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Setting/i })).not.toHaveAttribute('data-active')

    });

    it('Should redirect the user to the Dashboard Page', async () => {
        const user = userEvent.setup()
        renderComponent()

        const dashboard = screen.getByRole('link', { name: /dashboard/i })
        expect(dashboard).toBeInTheDocument()

        await user.click(dashboard)

        expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
        expect(dashboard).toHaveAttribute('href', '/dashboard')

        expect(dashboard).toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Alerts/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /My Reports/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Setting/i })).not.toHaveAttribute('data-active')
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

    it('Should redirect the user to the Report Page', async () => {
        const user = userEvent.setup()
        renderComponent()

        const reportPage = screen.getByRole('link', { name: /My Reports/i })
        expect(reportPage).toBeInTheDocument()

        await user.click(reportPage)

        expect(await screen.findByRole('heading', { name: /Your Reports/i })).toBeInTheDocument();
        expect(reportPage).toHaveAttribute('href', '/reports')

        expect(reportPage).toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Dashboard/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Alerts/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Setting/i })).not.toHaveAttribute('data-active')
    });

    it('Should redirect the user to the Setting Page', async () => {
        const user = userEvent.setup()
        renderComponent()

        const Setting = screen.getByRole('link', { name: /setting/i })
        expect(Setting).toBeInTheDocument()

        await user.click(Setting)

        expect(await screen.findByRole('heading', { name: /Setting/i })).toBeInTheDocument();
        expect(Setting).toHaveAttribute('href', '/setting')

        expect(Setting).toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Dashboard/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /Alerts/i })).not.toHaveAttribute('data-active')
        expect(screen.getByRole('link', { name: /My Report/i })).not.toHaveAttribute('data-active')
    });

    it('Should redirect the user on the correct path always', async () => {
        const user = userEvent.setup()
        renderComponent()

        const alertPage = screen.getByRole('link', { name: /Alerts/i })
        expect(alertPage).toBeInTheDocument()
        await user.click(alertPage)

        expect(alertPage).toHaveAttribute('href', '/alerts')
        expect(alertPage).toHaveAttribute('data-active')

        expect(await screen.findByRole('heading', { name: /^alerts$/i }))

        const reportPage = screen.getByRole('link', { name: /My Reports/i })
        expect(reportPage).toBeInTheDocument()
        await user.click(reportPage)

        expect(reportPage).toHaveAttribute('href', '/reports')
        expect(await screen.findByRole('heading', { name: /Your Reports/i }))

        const settingPage = screen.getByRole('link', { name: /Setting/i })
        expect(settingPage).toBeInTheDocument()
        await user.click(settingPage)

        expect(settingPage).toHaveAttribute('href', '/setting')
        expect(await screen.findByRole('heading', { name: /Setting/i }))

        const dashboard = screen.getByRole('link', { name: /dashboard/i })
        expect(dashboard).toBeInTheDocument()
        await user.click(dashboard)

        expect(dashboard).toHaveAttribute('href', '/dashboard')
        expect(await screen.findByRole('heading', { name: /dashboard/i }))
    });

    it("opens the profile menu for primary typography labels and interactive fields", async () => {
        useUser.getState().setUser({
            firstName: "Amir",
            lastName: "Shaikh",
            email: "amir@example.com",
        });

        const user = userEvent.setup();
        render(
            <AuthContext.Provider value={{ clearSession: vi.fn() }}>
                <MemoryRouter>
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                    <Toaster />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        const profileButton = screen.getByRole("button", { name: /Amir Shaikh/i, });

        expect(profileButton).toBeInTheDocument();

        await user.click(profileButton);

        expect(await screen.findByRole("menuitem", { name: /Log Out/i })).toBeInTheDocument();
        expect(screen.getByText(/profile setting/i)).toBeInTheDocument();
        expect(screen.getByText(/My Reports History/i)).toBeInTheDocument();
    });

    it('Should LogOut the user and redirect to Login Page', async () => {
        const clearSession = vi.fn();

        useUser.getState().setUser({
            firstName: "Amir",
            lastName: "Shaikh",
            email: "amir@example.com",
        });

        const user = userEvent.setup();
        render(
            <AuthContext.Provider value={{ clearSession }}>
                <MemoryRouter>
                    <SidebarProvider>
                        <AppSidebar />
                    </SidebarProvider>
                    <Login />
                    <Toaster />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        const profileButton = screen.getByRole("button", {
            name: /Amir Shaikh/i,
        });

        expect(profileButton).toBeInTheDocument();

        await user.click(profileButton);

        const logoutBtn = await screen.findByRole('menuitem', { name: /Log Out/i })
        expect(logoutBtn).toBeInTheDocument()

        await user.click(logoutBtn)

        expect(await screen.findByText(/Terminating Sessions/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(clearSession).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText(/logged out successfully/i)).toBeInTheDocument();
        expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();

    });

});