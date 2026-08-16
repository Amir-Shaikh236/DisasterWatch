import { Input } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/googleMaps";
import { MapPin, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AutoComplete({ value, onChange, onLocationSelect }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [PlacesLibrary, setPlacesLibrary] = useState(null);
    const sessionTokenRef = useRef(null)

    useEffect(() => {
        let mounted = true;

        const initializeGooglePlaces = async () => {
            try {
                await loadGoogleMaps();

                const places = await window.google.maps.importLibrary("places");
                if (!mounted) return;
                setPlacesLibrary(places)

                sessionTokenRef.current = new places.AutocompleteSessionToken();

            } catch (error) {
                console.error("Google Maps Initialization Failed: ", error);

            }
        }

        initializeGooglePlaces();

        return () => {
            mounted = false;
        }

    }, []);

    const handleChange = async (e) => {
        const input = e.target.value;
        onChange(input);

        if (!input.trim()) return setSuggestions([]);

        try {
            setIsLoading(true);
            const request = { input, sessionToken: sessionTokenRef.current, region: "In", language: "en" }
            const { AutocompleteSuggestion } = PlacesLibrary;

            const result = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
            setSuggestions(result.suggestions || []);

        } catch (error) {
            console.error("Autocomplete error:", error);
            setSuggestions([]);

        } finally {
            setIsLoading(false);
        }

    };

    const handleSelectPlace = async (suggestion) => {
        try {

            const prediction = suggestion.placePrediction;
            if (!prediction) return;

            const place = prediction.toPlace();

            await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "id"] });
            if (!place.location) return console.error("Selected Place does not contain coordinates");

            const selectedLocation = {
                placeId: place.id,
                address: place.formattedAddress,
                name: place.displayName,

                coordinates: {
                    latitude: place.location?.lat(),
                    longitude: place.location?.lng()
                },
            };
            onChange(place.formattedAddress || "");
            onLocationSelect?.(selectedLocation);
            setSuggestions([]);

            sessionTokenRef.current = new PlacesLibrary.AutocompleteSessionToken();

        } catch (error) {
            console.error("Failed to Retrive Selected Place: ", error);
        }
    };

    return (
        <div className="w-full relative">
            <Input value={value} onChange={handleChange} placeholder="Enter Location or Use GPS" autoComplete="off" className="w-full rounded-md pr-10 focus-visible:border-primary/60 focus-visible:ring-1" />
            {suggestions.length > 0 && (
                <div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                        {suggestions.map((sugesstion, index) => {
                            const prediction = sugesstion.placePrediction;
                            if (!prediction) return null;

                            return (
                                <button
                                    key={prediction.placeId ?? `${prediction.text}-${index}`}
                                    type="button"
                                    className="flex w-full items-center justify-items-end gap-2 border px-3 py-2 text-left hover:bg-accent cursor-pointer"
                                    onClick={() => handleSelectPlace(sugesstion)}
                                >
                                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{prediction.mainText?.toString()}</p>
                                        <p className="text-xs text-muted-foreground">{prediction.secondaryText?.toString()}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

