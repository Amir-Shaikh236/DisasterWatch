import Alerts from "@/pages/Alerts"
import { useAlerts } from "@/store/useAlerts"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { beforeEach, describe, expect, it } from "vitest"

const renderComponent = () => render(
    <MemoryRouter>
        <Alerts />
        <Toaster />
    </MemoryRouter>
);

describe("Setting Presentation Layout of Dashboard and Actions verification Suite", () => {

    it("Should Display an Alert Page and perform filter actions on alerts", async () => {
        const user = userEvent.setup()
        renderComponent();

        expect(await screen.findByRole('heading', { name: /^alerts$/i }))
        expect(await screen.findByRole('heading', { name: /recent disaster alerts/i }))

        const filterBtn = screen.getByRole("button", { name: /filter/i })
        expect(filterBtn).toBeInTheDocument()

        await user.click(filterBtn)

        expect(await screen.findByRole('heading', { name: /filter alerts/i })).toBeInTheDocument()
        expect(await screen.findByRole('heading', { name: /disaster type/i })).toBeInTheDocument()

        const earthquake = screen.getByRole('checkbox', { name: /earthquake/i })
        const flood = screen.getByRole('checkbox', { name: /flood/i })
        const landslide = screen.getByRole('checkbox', { name: /landslide/i })
        const wildfire = screen.getByRole('checkbox', { name: /wildfire/i })

        expect(earthquake).toBeInTheDocument()
        expect(flood).toBeInTheDocument()
        expect(landslide).toBeInTheDocument()
        expect(wildfire).toBeInTheDocument()

        expect(earthquake).not.toBeChecked()
        await user.click(earthquake)
        expect(earthquake).toBeChecked()

        expect(flood).not.toBeChecked()
        await user.click(flood)
        expect(flood).toBeChecked()

        expect(landslide).not.toBeChecked()
        await user.click(landslide)
        expect(landslide).toBeChecked()

        expect(wildfire).not.toBeChecked()
        await user.click(wildfire)
        expect(wildfire).toBeChecked()

        expect(await screen.findByLabelText(/severity/i)).toBeInTheDocument()

        const severityBtn = screen.getByRole('combobox', { name: /severity/i })
        expect(severityBtn).toBeInTheDocument()

        await user.click(severityBtn)
        await user.click(screen.getByRole('option', { name: /critical/i }))
        expect(severityBtn).toHaveTextContent(/critical/i)

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /Filter 5/i })).toBeInTheDocument()

        await user.click(filterBtn)
        const resetBtn = screen.getByRole('button', { name: /reset/i })
        expect(resetBtn).toBeInTheDocument()

        await user.click(resetBtn)

        waitFor(() => {
            expect(earthquake).not.toBeChecked()
            expect(flood).not.toBeChecked()
            expect(wildfire).not.toBeChecked()
            expect(landslide).not.toBeChecked()
            expect(severityBtn).toHaveTextContent(/all/i)
        });

    });

});