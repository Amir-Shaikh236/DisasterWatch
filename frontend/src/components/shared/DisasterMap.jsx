import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import FilterModal from "@/components/shared/FilterModal";
import { useAlerts } from "@/store/useAlerts";


export default function DisasterMap() {
    const [filters, setFilters] = useState({ disasterType: [], severity: 'all' });

    const AlertData = useAlerts((state) => state.alerts)

    const DISASTER_CONFIG = {
        earthquake: {
            label: "Earthquake",
            color: "#a78bfa",
        },

        landslide: {
            label: "Landslide",
            color: "#fbbf24",
        },

        flood: {
            label: "Flood",
            color: "#22d3ee",
        },

        wildfire: {
            label: "Wildfire",
            color: "#fb923c",
        },
    };

    const createPulseIcon = (disasterType) => {
        const disaster = DISASTER_CONFIG[disasterType]
        const color = disaster?.color ?? "#94a3b8";

        return L.divIcon({
            className: "custom-pulse-icon",
            html: `<div class="pulse-ring" style="background-color: ${color};"></div>`,
            iconSize: [25, 25],
            iconAnchor: [10, 10],
        });
    };

    const leafletZIndexFix = `
  .leaflet-pane { z-index: 1 !important; }
  .leaflet-tile-pane { z-index: 1 !important; }
  .leaflet-overlay-pane { z-index: 2 !important; }
  .leaflet-marker-pane { z-index: 3 !important; }
  .leaflet-popup-pane { z-index: 4 !important; }
  .leaflet-control-container { z-index: 10 !important; }
`;

    const customIconStyle =
        `.custom-pulse-icon .pulse-ring {
         width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        animation: pulse-animation 1.5s infinite cubic-bezier(0.215, 0.610, 0.355, 1);
    }

    @keyframes pulse-animation {
        0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
        70% { transform: scale(1.2); box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); }
        100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }`;

    const filteredAlerts = AlertData.filter((alert) => {
        const matchesDisasterTypes = filters.disasterType.length === 0 || filters.disasterType.includes(alert.disasterType);
        const matchesSeverity = filters.severity === "all" || filters.severity.includes(alert.severity);
        return matchesDisasterTypes && matchesSeverity;

    });

    const DISASTER_LEGEND = Object.values(DISASTER_CONFIG);

    return (
        <div>
            <Card className="mt-6 border bg-card shadow-md">
                <CardHeader className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-semibold tracking-tight"> Disaster Map </CardTitle>
                        <CardDescription className="text-sm tracking-wider text-muted-foreground -mt-1"> Live Disaster Alerts </CardDescription>
                    </div>
                    <FilterModal filters={filters} onApply={setFilters} onReset={() => setFilters({ disasterType: [], severity: 'all' })} />
                </CardHeader>
                <CardContent>
                    <style>{leafletZIndexFix + customIconStyle}</style>
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} className="h-150 w-full rounded-lg" >
                        <TileLayer attribution="&copy; OpenStreetmap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {filteredAlerts.map((data) => {
                            return (
                                < Marker key={data._id} position={[data.location.coordinates[1], data.location.coordinates[0]]} icon={createPulseIcon(data.disasterType)} >
                                    <Popup>
                                        <div className="font-sans">
                                            <h3 className="font-bold text-base mb-1"> {data.title} </h3>
                                            <p className="text-sm text-gray-700"> {data.description} </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Type: {" "} <span className="font-semibold capitalize"> {data.disasterType} </span>
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}

                        <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-md p-3 rounded-xl shadow-lg border">
                            <h4 className="text-sm font-semibold text-card-foreground mb-3"> Disaster Types </h4>
                            <div className="flex flex-col gap-2.5">
                                {DISASTER_LEGEND.map(item => (
                                    <div key={item.label} className="flex items-center gap-2.5 text-xs ">
                                        <span className="w-3 h-3 rounded-full shrink-0 ring-2 ring-background" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </MapContainer>
                </CardContent>
            </Card>
        </div >
    )
}