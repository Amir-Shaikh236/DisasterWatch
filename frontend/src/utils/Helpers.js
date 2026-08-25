import { getAddressFromCoordinates } from "@/lib/googleMaps";
import { toast } from "sonner";

export function formatDate(date) {
    if (!date) return "N/A";
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return "Invalid Date";

    return parsedDate.toLocaleDateString("en-In", {
        day: "2-digit",
        month: 'short',
        year: 'numeric'
    });
}

export const formatDisasterType = (type) => {
    if (!type) return "Unknown";
    return type.charAt(0).toUpperCase() + type.slice(1);
};

export const GPSLocation = () => {
    if (!navigator.geolocation) {
        toast.error("GeoLocation is not supported.");
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoordinates(latitude, longitude);

                resolve({ latitude, longitude, address: address || "" });

            } catch {
                toast.error("Failed to resolve GPS location.");
                resolve(null);

            }
        }, () => {
            toast.error("Failed to get location.");
            resolve(null);

        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
    });
};

