import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Flame, Mountain, Waves } from "lucide-react";


export default function DisasterMap() {

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


    return (
        <div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle> Disaster Map </CardTitle>
                    <CardDescription> Live Disaster Alerts </CardDescription>
                </CardHeader>
                <CardContent>
                    <style>{customIconStyle}</style>
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} className="h-150 w-full rounded-xl" >
                        <TileLayer attribution="&copy; OpenStreetmap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {AlertData.map((data) => {
                            return (
                                < Marker
                                    key={data.id}
                                    position={[data.location.coordinates[1], data.location.coordinates[0]]}
                                    icon={createPulseIcon(data.disasterType)}
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-semibold"> {data.title} </h3>
                                            <p> {data.description} </p>
                                            <p> {data.disasterType} </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>
                </CardContent>
                <CardFooter>

                </CardFooter>
            </Card>
        </div >
    )
}