import Dashboard from "@/pages/Dashboard"
import { useUser } from "@/store/useUser"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { GPSLocation } from "@/utils/Helpers";
import Alerts from "@/pages/Alerts"

vi.mock("@/utils/Helpers", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        GPSLocation: vi.fn(),
    };
});

const renderComponent = () => render(
    <MemoryRouter initialEntries={["/reports"]}>
        <Routes>
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
        </Routes>
        <Toaster />
    </MemoryRouter>
)

describe("Setting Presentation Layout of Dashboard and Actions verification Suite", () => {
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
        expect(screen.getByRole('heading', { name: /Disaster Map/i })).toBeInTheDocument();

    });

    it("Should Process the user submitted image for analysis smoothly", async () => {
        const user = userEvent.setup();
        renderComponent();

        const imgAnalyzer = screen.getByRole('button', { name: /image analyzer/i })
        expect(imgAnalyzer).toBeInTheDocument();

        await user.click(imgAnalyzer)

        expect(await screen.findByText(/advanced image analysis/i)).toBeInTheDocument();

        const uploadImg = screen.getByRole('button', { name: /choose image/i })
        expect(uploadImg).toBeInTheDocument();

        const fileInput = screen.getByLabelText(/image to analyze/i)
        const imageFile = new File(["mock image content"], "test-image.png", {
            type: "image/png",
        });

        await user.upload(fileInput, imageFile)

        const analyzeBtn = await screen.findByRole('button', { name: /analyze image/i })
        expect(analyzeBtn).toBeInTheDocument()

        await user.click(analyzeBtn);
        expect(await screen.findByRole('button', { name: /analyzing/i })).toBeInTheDocument();

        expect(await screen.findByRole('heading', { name: /ai analysis results/i })).toBeInTheDocument();
        expect(screen.getByText(/potential disaster detected/i)).toBeInTheDocument();
        expect(screen.getByText("Flood", { selector: "p" })).toBeInTheDocument();
        expect(screen.getByText(/Authentic Photo/i)).toBeInTheDocument();
        expect(screen.getByText(/standing water is visible/i)).toBeInTheDocument();

    });

    it("Should Process an User Submitted Report and create alert", async () => {
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

    it("Should Process the Filter Functionality as expected Smoothly", async () => {
        const user = userEvent.setup();
        renderComponent();

        const filterBtn = screen.getByRole('button', { name: /filter/i })

        expect(await screen.findByRole('heading', { name: /disaster map/i })).toBeInTheDocument();
        expect(filterBtn).toBeInTheDocument();

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
