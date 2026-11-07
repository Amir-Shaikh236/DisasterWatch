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

describe("Setting Presentation Layout of Alert and Actions verification Suite", () => {
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
                {
                    _id: "alert-flood-1",
                    disasterType: "flood",
                    title: "Flood warning",
                    description: "Flooding reported in the area",
                    severity: "high",
                    confidence: 0.9,
                    status: "Active",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-earthquake-1",
                    disasterType: "earthquake",
                    title: "Earthquake warning",
                    description: "Earthquake activity reported in the area",
                    severity: "high",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-landslide-1",
                    disasterType: "landslide",
                    title: "Landslide warning",
                    description: "landslide activity reported in the area",
                    severity: "high",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-wildfire-1",
                    disasterType: "wildfire",
                    title: "Wildfire warning",
                    description: "Wildfire activity reported in the area",
                    severity: "high",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-flood-2",
                    disasterType: "flood",
                    title: "Flood warning",
                    description: "Flooding reported in the area",
                    severity: "medium",
                    confidence: 0.9,
                    status: "Active",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-earthquake-2",
                    disasterType: "earthquake",
                    title: "Earthquake warning",
                    description: "Earthquake activity reported in the area",
                    severity: "medium",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-landslide-2",
                    disasterType: "landslide",
                    title: "Landslide warning",
                    description: "landslide activity reported in the area",
                    severity: "medium",
                    confidence: 0.8,
                    status: "Active",
                    sourceCount: 1,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Pune, India" },
                    media: [],
                },
                {
                    _id: "alert-wildfire-2",
                    disasterType: "wildfire",
                    title: "Wildfire warning",
                    description: "Wildfire activity reported in the area",
                    severity: "medium",
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

        expect(screen.queryByRole('option', { name: /all/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^critical$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^high$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^medium$/i })).not.toBeInTheDocument()

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

        await waitFor(() => {
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

        expect(await screen.findAllByText("flood", { exact: true })).toHaveLength(3)
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

        expect(await screen.findAllByText("wildfire", { exact: true })).toHaveLength(3)
        expect(screen.queryByText("earthquake", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("landslide", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("flood", { exact: true })).not.toBeInTheDocument()

    });

    it('Should display landslide alerts only, after applied filter', async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument()
        await user.click(filterBtn);

        const landslideBox = screen.getByRole('checkbox', { name: /landslide/i })
        expect(landslideBox).toBeInTheDocument()

        expect(landslideBox).not.toBeChecked()
        await user.click(landslideBox)
        expect(landslideBox).toBeChecked();

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findAllByText("landslide", { exact: true })).toHaveLength(3)
        expect(screen.queryByText("earthquake", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("wildfire", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("flood", { exact: true })).not.toBeInTheDocument()

    });

    it('Should display Earthquake alerts only, after applied filter', async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument()
        await user.click(filterBtn);

        const earthquakeBox = screen.getByRole('checkbox', { name: /earthquake/i })
        expect(earthquakeBox).toBeInTheDocument()

        expect(earthquakeBox).not.toBeChecked()
        await user.click(earthquakeBox)
        expect(earthquakeBox).toBeChecked();

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findAllByText("earthquake", { exact: true })).toHaveLength(3)
        expect(screen.queryByText("landslide", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("wildfire", { exact: true })).not.toBeInTheDocument()
        expect(screen.queryByText("flood", { exact: true })).not.toBeInTheDocument()

    });

    it("Should display all the critical alerts after selecting critical severity from filter", async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument();
        await user.click(filterBtn)

        const severityBtn = screen.getByRole('combobox', { name: /severity/i })
        expect(severityBtn).toBeInTheDocument();
        expect(severityBtn).toHaveTextContent(/all/i)

        expect(screen.queryByRole('option', { name: /all/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^critical$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^high$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^medium$/i })).not.toBeInTheDocument()

        await user.click(severityBtn)

        const criticalBtn = await screen.findByRole('option', { name: /^critical$/i })
        expect(criticalBtn).toBeInTheDocument()

        await user.click(criticalBtn)
        expect(severityBtn).toHaveTextContent(/critical/i)

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findAllByText(/critical Priority/i)).toHaveLength(4)
        expect(await screen.findAllByText(/high Priority/i)).toHaveLength(1)
        expect(screen.queryByText(/medium Priority/i)).not.toBeInTheDocument()
    });

    it("Should display all the high alerts after selecting high severity from filter", async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument();
        await user.click(filterBtn)

        const severityBtn = screen.getByRole('combobox', { name: /severity/i })
        expect(severityBtn).toBeInTheDocument();
        expect(severityBtn).toHaveTextContent(/all/i)

        expect(screen.queryByRole('option', { name: /all/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^critical$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^high$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^medium$/i })).not.toBeInTheDocument()

        await user.click(severityBtn)

        const highBtn = await screen.findByRole('option', { name: /^high$/i })
        expect(highBtn).toBeInTheDocument()

        await user.click(highBtn)
        expect(severityBtn).toHaveTextContent(/high/i)

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findAllByText(/high Priority/i)).toHaveLength(5)
        expect(screen.queryByText(/critical Priority/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/medium Priority/i)).not.toBeInTheDocument()
    });

    it("Should display all the Medium alerts after selecting Medium severity from filter", async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument();
        await user.click(filterBtn)

        const severityBtn = screen.getByRole('combobox', { name: /severity/i })
        expect(severityBtn).toBeInTheDocument();
        expect(severityBtn).toHaveTextContent(/all/i)

        expect(screen.queryByRole('option', { name: /all/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^critical$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^high$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^medium$/i })).not.toBeInTheDocument()

        await user.click(severityBtn)

        const mediumBtn = await screen.findByRole('option', { name: /^medium$/i })
        expect(mediumBtn).toBeInTheDocument()

        await user.click(mediumBtn)
        expect(severityBtn).toHaveTextContent(/medium/i)

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 1/i })).toBeInTheDocument()

        expect(await screen.findAllByText(/medium Priority/i)).toHaveLength(4)
        expect(await screen.findAllByText(/high Priority/i)).toHaveLength(1)
        expect(screen.queryByText(/critical Priority/i)).not.toBeInTheDocument()
    });

    it("Should display all the Flood alerts with severity critical after applying filter", async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })
        expect(filterBtn).toBeInTheDocument();
        await user.click(filterBtn)

        const floodBox = screen.getByRole('checkbox', { name: /flood/i })
        expect(floodBox).toBeInTheDocument();
        expect(floodBox).not.toBeChecked()

        await user.click(floodBox)
        expect(floodBox).toBeChecked()

        const severityBtn = screen.getByRole('combobox', { name: /severity/i })
        expect(severityBtn).toBeInTheDocument();
        expect(severityBtn).toHaveTextContent(/all/i)

        expect(screen.queryByRole('option', { name: /all/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^critical$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^high$/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /^medium$/i })).not.toBeInTheDocument()

        await user.click(severityBtn)

        const criticalBtn = await screen.findByRole('option', { name: /^critical$/i })
        expect(criticalBtn).toBeInTheDocument()

        await user.click(criticalBtn)
        expect(severityBtn).toHaveTextContent(/critical/i)

        const applyBtn = screen.getByRole('button', { name: /apply filters/i })
        expect(applyBtn).toBeInTheDocument()
        await user.click(applyBtn)

        expect(await screen.findByRole('button', { name: /filter 2/i })).toBeInTheDocument()

        const totalAlertsCard = screen.getByText(/Total Alerts/i).parentElement
        expect(totalAlertsCard).toHaveTextContent(/Total Alerts\s*1/i)

        const criticalAlertsCard = screen.getByText(/critical Alerts/i).parentElement
        expect(criticalAlertsCard).toHaveTextContent(/critical Alerts\s*1/i)

        const HgihPriotiyCard = screen.getByText(/High Priority/i).parentElement
        expect(HgihPriotiyCard).toHaveTextContent(/High Priority\s*0/i)

        expect(await screen.findAllByText(/critical Priority/i)).toHaveLength(1)
        expect(await screen.findAllByText(/high Priority/i)).toHaveLength(1)

        expect(screen.queryByText(/medium Priority/i)).not.toBeInTheDocument()
    });

});