import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
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

describe("Register Presentation Layout of SignUp Page and Action verification Suite", () => {

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
});