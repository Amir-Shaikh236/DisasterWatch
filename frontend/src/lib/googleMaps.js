import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let googleMapsPromise;

export function loadGoogleMaps() {
    if (!googleMapsPromise) {
        setOptions({
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            v: "weekly"
        });

        googleMapsPromise = Promise.all([
            importLibrary("maps"),
            importLibrary("places")
        ]);
    }

    return googleMapsPromise;
}

export const getAddressFromCoordinates = async (lat, lng) => {
    try {
        await loadGoogleMaps();

        const { Geocoder } = await importLibrary('geocoding');
        const geocoder = new Geocoder();

        const response = await geocoder.geocode({ location: { lat, lng } });

        if (response.results?.length > 0) return response.results[0].formatted_address;
        return null;
    } catch (error) {
        console.error("Reverse GeoCoding Failed", error);
        return null;
    }
};