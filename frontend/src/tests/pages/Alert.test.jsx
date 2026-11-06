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
    beforeEach(() => {
        useAlerts.setState({
            alerts: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    title: "Flood warning",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "Active",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-earthquake",
                    disasterType: "earthquake",
                    title: "Earthquake warning",
                    description: "Earthquake activity reported in the area",
                    severity: "critical",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-landslide",
                    disasterType: "landslide",
                    title: "Landslide warning",
                    description: "landslide activity reported in the area",
                    severity: "critical",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-wildfire",
                    disasterType: "wildfire",
                    title: "Wildfire warning",
                    description: "Wildfire activity reported in the area",
                    severity: "critical",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
            ],
        });
    });

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
            expect(screen.getByRole('checkbox', { name: /earthquake/i })).not.toBeChecked()
            expect(screen.getByRole('checkbox', { name: /flood/i })).not.toBeChecked()
            expect(screen.getByRole('checkbox', { name: /landslide/i })).not.toBeChecked()
            expect(screen.getByRole('checkbox', { name: /wildfire/i })).not.toBeChecked()
            expect(screen.getByRole('combobox', { name: /severity/i })).toHaveTextContent(/all/i)
        });

    });

    it('Should display Flood alerts only, after applied filter', async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument()
        await user.click(filterBtn);

        const floodBox = screen.getByRole('checkbox', { name: /flood/i })
        expect(floodBox).toBeInTheDocument()

        expect(floodBox).not.toBeChecked()
        await user.click(floodBox)
        expect(floodBox).toBeChecked();

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findByText("flood", { exact: true })).toBeInTheDocument()
        expect(screen.queryByText("earthquake", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("landslide", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("wildfire", { exact: true })).not.toBeInTheDocument()

    });

    it('Should display wildFire alerts only, after applied filter', async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument()
        await user.click(filterBtn);

        const wildfireBox = screen.getByRole('checkbox', { name: /wildfire/i })
        expect(wildfireBox).toBeInTheDocument()

        expect(wildfireBox).not.toBeChecked()
        await user.click(wildfireBox)
        expect(wildfireBox).toBeChecked();

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findByText("wildfire", { exact: true })).toBeInTheDocument()
        expect(screen.queryByText("earthquake", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("landslide", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("flood", { exact: true })).not.toBeInTheDocument()

    });

});