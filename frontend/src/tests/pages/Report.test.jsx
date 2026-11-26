import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import { useReports } from "@/store/useReports";
import { useUser } from "@/store/useUser";
import { GPSLocation } from "@/utils/Helpers";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/Helpers", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        GPSLocation: vi.fn()
    }
});

const renderComponent = () => render(
    <MemoryRouter initialEntries={["/reports"]}>
        <Routes>
            <Route path="/reports" element={<Reports />} />
            <Route path="/alerts" element={<Alerts />} />
        </Routes>
        <Toaster />
    </MemoryRouter>
)

describe("Report submission, validation, and history", () => {

    it("submits a valid disaster report", async () => {
        const user = userEvent.setup();
        renderComponent();

        const reportBtn = screen.getByRole('button', { name: /Submit Report/i })
        expect(reportBtn).toBeInTheDocument()
        await user.click(reportBtn)

        expect(screen.getByRole('heading', { name: /submit disaster report/i })).toBeInTheDocument()

        const submitBtn = screen.getByRole('button', { name: /submit/i })
        expect(submitBtn).toBeInTheDocument()

        const disasterType = screen.getByRole('combobox', { name: /disaster Type/i });
        await user.click(disasterType)
        await user.click(await screen.findByRole('option', { name: /Flood/i }));

        const description = screen.getByLabelText(/Description/i)
        expect(description).toBeInTheDocument();
        await user.type(description, "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.")

        const location = screen.getByLabelText(/location/i)
        expect(location).toBeInTheDocument();

        vi.mocked(GPSLocation).mockResolvedValue({
            latitude: 19.076,
            longitude: 72.8777,
            address: "Mumbai, India",
        });

        await user.click(screen.getByRole("button", { name: /GPS/i }));

        const uploadImg = screen.getByLabelText(/report images/i)
        expect(uploadImg).toBeInTheDocument();

        const imageFile = new File(["mock image content"], "test-image.png", {
            type: "image/png",
        });
        await user.upload(uploadImg, imageFile)

        expect(disasterType).toHaveTextContent(/flood/i);
        expect(description).toHaveTextContent("Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.")
        expect(location).toHaveValue("Mumbai, India");
        expect(await screen.findByText(/test-image.png/i)).toBeInTheDocument();

        await user.click(submitBtn)
        expect(submitBtn).toBeDisabled();
        expect(await screen.findByRole('button', { name: /submitting.../i })).toBeInTheDocument();

        expect(await screen.findByText(/Report Submitted Successfully! Our AI will verify your report and update the status soon./i)).toBeInTheDocument()

    });

    it("clears the report form when reset is selected", async () => {
        const user = userEvent.setup();
        renderComponent();

        const reportBtn = screen.getByRole('button', { name: /Submit Report/i })
        expect(reportBtn).toBeInTheDocument()
        await user.click(reportBtn)

        expect(screen.getByRole('heading', { name: /submit disaster report/i })).toBeInTheDocument()

        const submitBtn = screen.getByRole('button', { name: /submit/i })
        expect(submitBtn).toBeInTheDocument()

        const disasterType = screen.getByRole('combobox', { name: /disaster Type/i });
        await user.click(disasterType)
        await user.click(await screen.findByRole('option', { name: /Flood/i }));

        const description = screen.getByLabelText(/Description/i)
        expect(description).toBeInTheDocument();
        await user.type(description, "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.")

        const location = screen.getByLabelText(/location/i)
        expect(location).toBeInTheDocument();

        vi.mocked(GPSLocation).mockResolvedValue({
            latitude: 19.076,
            longitude: 72.8777,
            address: "Mumbai, India",
        });

        await user.click(screen.getByRole("button", { name: /GPS/i }));

        const uploadImg = screen.getByLabelText(/report images/i)
        expect(uploadImg).toBeInTheDocument();

        const imageFile = new File(["mock image content"], "test-image.png", {
            type: "image/png",
        });
        await user.upload(uploadImg, imageFile)

        expect(disasterType).toHaveTextContent(/flood/i);
        expect(description).toHaveTextContent("Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.")
        expect(location).toHaveValue("Mumbai, India");
        expect(await screen.findByText(/test-image.png/i)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /reset/i }))
        expect(disasterType).toHaveTextContent(/Disaster Type/i);
        expect(description).toHaveTextContent("")
        expect(location).toHaveValue("");

        await user.click(submitBtn)
        expect(screen.getByText(/Select a Disaster Type/i)).toBeInTheDocument()
        expect(screen.getByText(/Description must be atleast 24 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please Select a Location/i)).toBeInTheDocument()

    });

    it("requires all mandatory report fields before submission", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /submit report/i }))
        await user.click(screen.getByRole('button', { name: /submit/i }))
        expect(screen.getByText(/Select a Disaster Type/i)).toBeInTheDocument()
        expect(screen.getByText(/Description must be atleast 24 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please Select a Location/i)).toBeInTheDocument()

    });

    it("requires a disaster type before submission", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /submit report/i }))

        const description = screen.getByLabelText(/Description/i)
        expect(description).toBeInTheDocument();
        await user.type(description, "Water levels have risen above 3 feet, submerging residential streets. Multiple families have been evacuated by local rescue teams.")

        const location = screen.getByLabelText(/location/i)
        expect(location).toBeInTheDocument();

        vi.mocked(GPSLocation).mockResolvedValue({
            latitude: 19.076,
            longitude: 72.8777,
            address: "Mumbai, India",
        });

        await user.click(screen.getByRole("button", { name: /GPS/i }));

        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(screen.getByText(/Select a Disaster Type/i)).toBeInTheDocument()

    });

    it("requires a description of at least 24 characters", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /submit report/i }))

        const disasterType = screen.getByRole('combobox', { name: /disaster Type/i });
        await user.click(disasterType)
        await user.click(await screen.findByRole('option', { name: /Flood/i }));

        const description = screen.getByLabelText(/Description/i)
        expect(description).toBeInTheDocument();
        await user.type(description, "this is Flood Report")

        const location = screen.getByLabelText(/location/i)
        expect(location).toBeInTheDocument();

        vi.mocked(GPSLocation).mockResolvedValue({
            latitude: 19.076,
            longitude: 72.8777,
            address: "Mumbai, India",
        });

        await user.click(screen.getByRole("button", { name: /GPS/i }));

        await user.click(screen.getByRole('button', { name: /submit/i }))
        expect(screen.getByText(/Description must be atleast 24 characters/i)).toBeInTheDocument()

    });

    it("requires a location before submitting a report", async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /submit report/i }))

        const disasterType = screen.getByRole('combobox', { name: /disaster type/i })
        await user.click(disasterType)
        await user.click(await screen.findByRole('option', { name: /flood/i }))
        expect(disasterType).toHaveTextContent(/flood/i)

        const description = screen.getByLabelText(/description/i)
        await user.type(description, "This is flood covering all the road causing traffic")
        expect(description).toHaveTextContent(/This is flood covering all the road causing traffic/i)

        await user.click(screen.getByRole('button', { name: /submit/i }))
        expect(screen.findByText(/Please Select a Location/i))

    });

    it("navigates to alerts when a report's details are opened", async () => {
        const user = userEvent.setup()
        renderComponent()

        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        expect(await screen.findByRole('heading', { name: /Your Reports/i }));

        const detailBtn = screen.getByRole('link', { name: /view Details/i })
        expect(detailBtn).toBeInTheDocument()

        await user.click(detailBtn)

        expect(await screen.findByRole('heading', { name: /^Alerts$/i }))

    });

    it("closes the report form when cancelled", async () => {
        const user = userEvent.setup();
        renderComponent()

        await user.click(screen.getByRole('button', { name: /submit report/i }))

        const reportELement = screen.getByRole('heading', { name: /submit disaster report/i })

        expect(reportELement).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(reportELement).not.toBeInTheDocument();


    });

    it("allows an admin to review the warning before deleting a report", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        useUser.getState().setUser({
            firstName: "Amir",
            lastName: "Shaikh",
            email: "amir@example.com",
            role: 'admin'
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /Your Reports/i }))

        const deleteBtn = screen.getByRole('button', { name: /delete/i })
        expect(deleteBtn).toBeInTheDocument();

        await user.click(deleteBtn)

        expect(await screen.findByRole('heading', { name: /DELETE Report/i }))
        expect(await screen.findByLabelText('description', {
            name: /This action cannot be undone Deleting this REPORT will permanently remove the report and all of its related assets, including uploaded images and associated alert/i
        }));

        expect(await screen.findByRole('button', { name: /delete/i }))
        expect(await screen.findByRole('button', { name: /Cancel/i }))

    });

    it("deletes a report after confirmation in the dialog", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        useUser.getState().setUser({
            firstName: "Amir",
            lastName: "Shaikh",
            email: "amir@example.com",
            role: 'admin'
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /^Your Reports$/i }))

        const deleteBtn = screen.getByRole('button', { name: 'Delete' })
        expect(deleteBtn).toBeInTheDocument();

        await user.click(deleteBtn)

        expect(await screen.findByRole('heading', { name: /DELETE Report/i }))
        expect(await screen.findByLabelText('description', { name: /This action cannot be undone Deleting this REPORT will /i }));

        const deleteAlert = screen.getByRole('button', { name: /delete/i })
        expect(deleteAlert).toBeInTheDocument()

        await user.click(deleteAlert)
        expect(await screen.findByRole('button', { name: /deleting.../i }))
        expect(await screen.findByText(/Report Deleted Successfully/i))

        expect(screen.queryByRole('heading', { name: /DELETE Report/i })).not.toBeInTheDocument()

    });

    it("closes the delete dialog without deleting the report when cancelled", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        useUser.getState().setUser({
            firstName: "Amir",
            lastName: "Shaikh",
            email: "amir@example.com",
            role: 'admin'
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /^Your Reports$/i }))

        const deleteBtn = screen.getByRole('button', { name: 'Delete' })
        expect(deleteBtn).toBeInTheDocument();

        await user.click(deleteBtn)

        expect(await screen.findByRole('heading', { name: /DELETE Report/i }))
        expect(await screen.findByLabelText('description', { name: /This action cannot be undone Deleting this REPORT/i }));

        const deleteAlert = screen.getByRole('button', { name: /delete/i })
        expect(deleteAlert).toBeInTheDocument()

        const CancelBtn = screen.getByRole('button', { name: /cancel/i })
        expect(CancelBtn).toBeInTheDocument()

        await user.click(CancelBtn)
        expect(screen.queryByRole('heading', { name: /DELETE Report/i })).not.toBeInTheDocument()

    });

    it("shows only rejected reports when the rejected status filter is selected", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "rejected",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /^Your Reports$/i })).toBeInTheDocument()
        expect(await screen.findByText(/^Total Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Unverified Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Under Investigation$/i)).toBeInTheDocument()

        expect(await screen.findByText('Verified')).toBeInTheDocument()
        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()

        const verifiedBtn = screen.getByText(/^Verified Reports$/i)
        expect(verifiedBtn).toBeInTheDocument()

        await user.click(verifiedBtn)

        expect(await screen.findByText('Verified')).toBeInTheDocument()
        expect(screen.queryByText(/rejected/i)).not.toBeInTheDocument()

    });

    it("shows only verified reports when the verified status filter is selected", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "rejected",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /^Your Reports$/i })).toBeInTheDocument()
        expect(await screen.findByText(/^Total Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Unverified Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Under Investigation$/i)).toBeInTheDocument()

        expect(await screen.findByText('Verified')).toBeInTheDocument()
        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()

        const verifiedBtn = screen.getByText(/^Unverified Reports$/i)
        expect(verifiedBtn).toBeInTheDocument()

        await user.click(verifiedBtn)

        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()
        expect(screen.queryByText('Verified')).not.toBeInTheDocument()

    });

    it("shows all reports when the total reports filter is selected", async () => {
        useReports.setState({
            reports: [
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "verified",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
                {
                    _id: "alert-flood",
                    disasterType: "flood",
                    description: "Flooding reported in the area",
                    severity: "critical",
                    confidence: 0.9,
                    status: "rejected",
                    sourceCount: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    location: { address: "Mumbai, India" },
                    media: [],
                },
            ]
        });

        const user = userEvent.setup()
        renderComponent()

        expect(await screen.findByRole('heading', { name: /^Your Reports$/i })).toBeInTheDocument()
        expect(await screen.findByText(/^Total Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Unverified Reports$/i)).toBeInTheDocument()
        expect(await screen.findByText(/^Under Investigation$/i)).toBeInTheDocument()

        expect(await screen.findByText('Verified')).toBeInTheDocument()
        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()

        const verifiedBtn = screen.getByText(/^Unverified Reports$/i)
        expect(verifiedBtn).toBeInTheDocument()

        await user.click(verifiedBtn)

        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()
        expect(screen.queryByText('Verified')).not.toBeInTheDocument()

        const TotalBtn = screen.getByText(/^Total Reports$/i)
        expect(TotalBtn).toBeInTheDocument()

        await user.click(TotalBtn)

        expect(await screen.findByText('Verified')).toBeInTheDocument()
        expect(await screen.findByText(/rejected/i)).toBeInTheDocument()

    });

});