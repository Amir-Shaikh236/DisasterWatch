import Dashboard from "@/pages/Dashboard"
import { useUser } from "@/store/useUser"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { GPSLocation } from "@/utils/Helpers";

vi.mock("@/utils/Helpers", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        GPSLocation: vi.fn(),
    };
});


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

    it("Should Process an User Submitted Report and create alert ", async () => {
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
        await user.click(screen.getByRole('option', { name: /Flood/i }));

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


    });

});
