import { Activity, AlertTriangle, ArrowUpRight, Clock3, Eye, Flame, MapPin, Mountain, ShieldCheck, TrendingUp, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Alerts() {

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
            location: "Pune District, Maharashtra",
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
            location: "Surat District, Gujarat",
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
            location: "Nashik District, Maharashtra",
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
            location: "Munnar, Kerala",
            reportedAt: "47 minutes ago",
            reportCount: 9,
        },
    ];

    const STATUS_STYLE = {
        verified: {
            label: "Verified",
            badgeClass: "border-emerald-300/40 bg-emerald-950/85 text-emerald-200 shadow-lg shadow-black/20 backdrop-blur-md",
            accent: "bg-emerald-300",
        },

        investigating: {
            label: "Investigating",
            badgeClass: "border-amber-300/40 bg-amber-950/85 text-amber-400 shadow-lg shadow-black/20 backdrop-blur-md animate-pulse",
            accent: "bg-amber-600",
        },

        unverified: {
            label: "Unverified",
            badgeClass: "border-slate-300/30 bg-slate-950/85 text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md",
            accent: "bg-slate-300",
        },
    };

    const SEVERITY_STYLE = {
        critical: {
            label: "Critical",
            color: "bg-destructive",
            text: "text-destructive",
        },

        high: {
            label: "High",
            color: "bg-amber-400",
            text: "text-amber-300",
        },

        moderate: {
            label: "Moderate",
            color: "bg-muted-foreground",
            text: "text-muted-foreground",
        },
    };

    const DISASTER_ICON = {
        earthquake: {
            icon: Activity,
            iconColor: 'text-violet-400',
        },

        landslide: {
            icon: Mountain,
            iconColor: 'text-amber-400',
        },
        flood: {
            icon: Waves,
            iconColor: 'text-cyan-400',
        },

        wildfire: {
            icon: Flame,
            iconColor: 'text-orange-400',
        }
    };

    const TotalAlerts = [
        {
            name: "Total Alerts",
            length: AlertData.length,
            icon: AlertTriangle,
            iconClass: "text-primary"
        },

        {
            name: "Critical Alerts",
            length: AlertData.filter((alert) => alert.severity === 'critical').length,
            icon: AlertTriangle,
            iconClass: "text-destructive animate-pulse"
        },

        {
            name: "High Priority",
            length: AlertData.filter((alert) => alert.severity === 'high').length,
            icon: TrendingUp,
            iconClass: "text-amber-300"
        },

        {
            name: "Average Confidence",
            length: `${(AlertData.reduce((total, alert) => total + alert.confidence, 0) / AlertData.length).toFixed(1)}%`,
            icon: Eye,
            iconClass: "text-emerald-300"
        },
    ];

    function ConfidenceMeter({ value }) {
        const tone = value >= 75 ? "bg-emerald-400" : value >= 45 ? "bg-amber-400" : "bg-destructive";

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"> Confidence </span>
                    <span className="text-xs font-semibold tabular-nums text-foreground"> {value}% </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${tone}`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex-1 bg-background p-6 text-foreground lg:p-9">

            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10 ring-1 ring-primary/20">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl"> Active Alerts </h1>
                        <p className="text-sm text-muted-foreground lg:text-base">
                            Monitor and review active disaster alerts
                        </p>
                    </div>

                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {TotalAlerts.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.name} className="cursor-pointer border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                            <CardContent className="flex items-center justify-between px-6 py-1">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground"> {item.name} </p>
                                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground"> {item.length} </p>
                                </div>

                                <div className={`flex h-11 w-11 items-center justify-center rounded`}>
                                    <Icon className={`h-8 w-8 ${item.iconClass}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

            </div>

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold"> Recent Disaster Alerts </h2>
                    <p className="text-sm text-muted-foreground">
                        Latest reports requiring attention
                    </p>
                </div>

                <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary"> {AlertData.length} Active </Badge>
            </div>

            <Separator className="mt-4 mb-4" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {AlertData.map((data) => {
                    const statusStyle = STATUS_STYLE[data.status] ?? STATUS_STYLE.unverified;

                    const severityStyle = SEVERITY_STYLE[data.severity] ?? SEVERITY_STYLE.moderate;

                    const disasterIcon = DISASTER_ICON[data.disasterType] ?? { icon: AlertTriangle, iconColor: 'text-muted-foreground' };

                    return (

                        <Card key={data.id} className="group overflow-hidden border-border/70 bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                            <div className="relative h-44 overflow-hidden cursor-pointer">

                                <img src={data.imageUrl} alt={data.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />

                                <div className="absolute inset-0 bg-linear-to-t  from-slate-950/75  via-slate-950/10 to-transparent" />

                                <div className=" absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-white shadow-sm backdrop-blur-md">
                                    <disasterIcon.icon className={`h-3.5 w-3.5 ${disasterIcon.iconColor}`} />
                                    <span className="text-xs font-semibold"> {data.disasterType}</span>
                                </div>

                                <Badge variant="outline" className={`absolute right-4 top-4 rounded-full border px-2.5 py-3 backdrop-blur-md ${statusStyle.badgeClass}`}>
                                    <span className={`mr-0.5 h-2 w-2 rounded-full ${statusStyle.accent}`} /> {statusStyle.label}
                                </Badge>

                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span> {data.location} </span>
                                </div>
                            </div>

                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${severityStyle.color}`} />
                                    <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${severityStyle.text}`}>
                                        {severityStyle.label} Priority
                                    </span>
                                </div>

                                <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-card-foreground">
                                    {data.title}
                                </h3>
                                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground"> {data.description} </p>

                                <ConfidenceMeter value={data.confidence} />

                                <div className="flex items-center justify-between border-t border-border/70 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        <span> {data.reportCount} Reports </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        <span> {data.reportedAt} </span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="border-t border-border/70 bg-muted/10 px-5 py-3">
                                <Button variant="ghost" className="ml-auto h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer">
                                    View Details
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div >
    );
}