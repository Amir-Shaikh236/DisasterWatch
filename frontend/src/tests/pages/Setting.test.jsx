import Setting from "@/pages/Setting";
import { privateClient } from "@/api/api";
import { useUser } from "@/store/useUser";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestNotificationPermission } from "@/services/notification";
import { GPSLocation } from "@/utils/Helpers";

vi.mock("@/services/notification", () => ({
    requestNotificationPermission: vi.fn(),
}));

vi.mock("@/utils/Helpers", () => ({
    GPSLocation: vi.fn(),
}));


const renderComponent = () => render(
    <MemoryRouter>
        <Setting />
        <Toaster />
    </MemoryRouter>
);

describe("Setting Presentation Layout and Actions verification Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUser.setState({
            user: {
                id: "usr_123",
                email: "amir.shaikh@disasterwatch.io",
                notification: false,
            },
            loading: false,
        });
    });

    it("should update user location in the database when location sharing is enabled", async () => {
        const user = userEvent.setup();
        const updateUser = vi.spyOn(privateClient, "post").mockResolvedValue({
            data: { status: "success" },
        });

        vi.mocked(requestNotificationPermission).mockResolvedValue("mock-fcm-token");
        vi.mocked(GPSLocation).mockResolvedValue({
            latitude: 19.076,
            longitude: 72.8777,
            address: "Mumbai, India",
        });

        renderComponent();

        const sharingSwitch = screen.getByRole("switch");
        expect(sharingSwitch).toHaveAttribute("aria-checked", "false");
        expect(screen.getByText(/Sharing Disabled/i)).toBeInTheDocument();

        await user.click(sharingSwitch);

        await waitFor(() => {
            expect(updateUser).toHaveBeenCalledWith("/api/auth/user/update", {
                token: "mock-fcm-token",
                notification: true,
                location: {
                    type: "Point",
                    coordinates: [72.8777, 19.076],
                    address: "Mumbai, India",
                },
            });
        });

        expect(sharingSwitch).toHaveAttribute("aria-checked", "true");
        expect(screen.getByText(/Sharing Enabled/i)).toBeInTheDocument();

        await user.click(sharingSwitch);
        expect(sharingSwitch).toHaveAttribute("aria-checked", "false");
        expect(screen.getByText(/Sharing Disabled/i)).toBeInTheDocument();

    });
});
