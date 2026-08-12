import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Mountain, Waves } from "lucide-react";
import { useState } from "react";
import FilterModal from "@/components/shared/FilterModal";


export default function DisasterMap() {
    const [filters, setFilters] = useState({ disasterType: [], severity: 'all' });

    const AlertData = [
        {
            id: 1,
            title: "Strong Earthquake Reported Near Pune",
            description: "A strong earthquake has been reported across several areas near Pune. Multiple residents have reported intense shaking, cracked walls, and minor structural damage.",
            imageUrl: "https://images.unsplash.com/photo-1561485132-59468cd0b553?w=1200&q=80",
            disasterType: "earthquake",
            severity: "critical",
            status: "verified",
            confidence: 96,
            location: {
                type: "Point",
                coordinates: [18.5204, 73.8567],
            },
            reportedAt: "8 minutes ago",
            reportCount: 24,
        },

        {
            id: 2,
            title: "Flooding Reported Across Riverside Areas",
            description: "Heavy rainfall has caused significant flooding across low-lying residential areas. Several roads are submerged and emergency teams have been requested.",
            imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80",
            disasterType: "flood",
            severity: "critical",
            status: "investigating",
            confidence: 89,
            location: {
                type: "Point",
                coordinates: [72.8311, 21.1702],
            },
            reportedAt: "15 minutes ago",
            reportCount: 18,
        },

        {
            id: 3,
            title: "Wildfire Spreading Through Forest Region",
            description: "A rapidly spreading wildfire has been observed in a forested region. Thick smoke is visible from nearby communities and authorities are monitoring the fire.",
            imageUrl: "https://www.drought.gov/sites/default/files/hero/news/western-wildfires.jpg",
            disasterType: "wildfire",
            severity: "high",
            status: "verified",
            confidence: 93,
            location: {
                type: "Point",
                coordinates: [73.7898, 19.9975],
            },
            reportedAt: "32 minutes ago",
            reportCount: 15,
        },

        {
            id: 4,
            title: "Landslide Blocks Mountain Access Road",
            description: "Heavy rainfall has triggered a landslide along a mountain road. Mud, rocks, and debris have blocked the roadway and disrupted local transportation.",
            imageUrl: "https://images.unsplash.com/photo-1647125849914-5238985ab21a?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            disasterType: "landslide",
            severity: "high",
            status: "unverified",
            confidence: 78,
            location: {
                type: "Point",
                coordinates: [73.0169, 19.2183],
            },
            reportedAt: "47 minutes ago",
            reportCount: 9,
        },
    ];

    const DISASTER_ICON = {
        earthquake: {
            icon: Activity,
            color: "#a78bfa",
        },

        landslide: {
            icon: Mountain,
            color: "#fbbf24",
        },

        flood: {
            icon: Waves,
            color: "#22d3ee",
        },

        wildfire: {
            icon: Flame,
            color: "#fb923c",
        },
    };

    const createPulseIcon = (disasterType) => {
        const disaster = DISASTER_ICON[disasterType]
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
                                < Marker key={data.id} position={[data.location.coordinates[1], data.location.coordinates[0]]} icon={createPulseIcon(data.disasterType)} >
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
                    </MapContainer>
                </CardContent>
            </Card>
        </div >
    )
}