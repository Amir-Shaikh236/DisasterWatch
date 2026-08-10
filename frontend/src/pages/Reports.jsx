import { Separator } from "@/components/ui/separator"
import { Activity, AlertTriangle, ArrowUpRight, Clock3, FileText, Flame, MapPin, Mountain, ShieldCheck, Waves, Verified, ScanSearch, ShieldQuestion } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Reports() {

    const ReportData = [
        {
            id: 1,
            title: "Strong Earthquake Felt Across Pune District",
            disasterType: "earthquake",
            description: "Residents across several areas of Pune reported strong ground shaking. Minor cracks have been observed in some residential buildings, while emergency teams are assessing the affected areas.",
            location: {
                type: "Point",
                coordinates: [73.8567, 18.5204],
            },
            media: [
                {
                    url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80",
                    publicId: "dummy-earthquake-001",
                },
            ],

            status: "investigating",
            aiAnalysis: {
                classification: "earthquake",
                confidence: 0.94,
                severity: "high",
                summary: "The report is highly consistent with an earthquake event based on the submitted description and location.",
            },
        },

        {
            id: 2,
            title: "Severe Flooding Reported in Riverside Residential Area",
            disasterType: "flood",
            description: "Continuous heavy rainfall has caused water levels to rise rapidly in several low-lying residential areas. Multiple streets are partially submerged and residents are being advised to move to safer locations.",
            location: {
                type: "Point",
                coordinates: [72.8311, 21.1702],
            },
            media: [
                {
                    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80",
                    publicId: "dummy-flood-001",
                },
            ],

            status: "verified",
            aiAnalysis: {
                classification: "flood",
                confidence: 0.91,
                severity: "critical",
                summary: "The report indicates significant flooding affecting residential roads and low-lying areas.",
            },
        },

        {
            id: 3,
            title: "Wildfire Spreading Near Forest Settlement",
            disasterType: "wildfire",
            description: "A rapidly spreading fire has been reported in a forested region near a residential settlement. Thick smoke is visible from nearby roads and local authorities are monitoring the situation.",
            location: {
                type: "Point",
                coordinates: [73.7898, 19.9975],
            },
            media: [
                {
                    url: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80",
                    publicId: "dummy-wildfire-001",
                },
            ],

            status: "unverified",
            aiAnalysis: {
                classification: "wildfire",
                confidence: 0.86,
                severity: "high",
                summary: "The submitted report shows characteristics consistent with a wildfire spreading through a forested area.",
            },
        },

        {
            id: 4,
            title: "Landslide Blocks Mountain Access Road",
            disasterType: "landslide",
            description: "Heavy rainfall has triggered a landslide along a mountain road. Large rocks, mud, and debris have blocked one side of the road, preventing normal vehicle movement.",
            location: {
                type: "Point",
                coordinates: [77.0595, 10.0889],
            },
            media: [
                {
                    url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=1200&q=80",
                    publicId: "dummy-landslide-001",
                },
            ],

            status: "investigating",
            aiAnalysis: {
                classification: "landslide",
                confidence: 0.79,
                severity: "high",
                summary:
                    "The report is potentially consistent with a rainfall-triggered landslide affecting a mountain access road.",
            },
        },

        {
            id: 5,
            title: "Minor Flooding Reported After Heavy Rainfall",
            disasterType: "flood",
            description: "Several streets in the city have experienced temporary waterlogging following intense rainfall. Traffic movement has been affected, but no major structural damage has been reported.",
            location: {
                type: "Point",
                coordinates: [73.0169, 19.2183],
            },
            media: [
                {
                    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&q=80",
                    publicId: "dummy-flood-002",
                },
            ],

            status: "verified",
            aiAnalysis: {
                classification: "flood",
                confidence: 0.72,
                severity: "moderate",
                summary:
                    "The report indicates localized flooding and waterlogging following heavy rainfall.",
            },
        },
    ];


    const TotalReports = [
        { name: 'Total Reports', length: ReportData.length, icon: FileText, iconClass: 'text-blue-400' },
        { name: 'Verified', length: ReportData.filter((report) => report.status === 'verified').length, icon: Verified, iconClass: 'text-primary' },
        { name: 'Under Investigation', length: ReportData.filter((report) => report.status === 'investigating').length, icon: ScanSearch, iconClass: 'text-amber-400' },
        { name: 'Unverified', length: ReportData.filter((report) => report.status === 'unverified').length, icon: ShieldQuestion, iconClass: 'text-muted-foreground' }
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
                        <FileText className="h-8 w-8 text-blue-400" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl"> Your Reports </h1>
                        <p className="text-sm text-muted-foreground lg:text-base">
                            The History Of All Your Reports You've Submitted
                        </p>
                    </div>

                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {TotalReports.map((item) => {
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

            <Separator className="mt-5 mb-5" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {ReportData.map((data) => {
                    const statusStyle = STATUS_STYLE[data.status] ?? STATUS_STYLE.unverified;

                    const severityStyle = SEVERITY_STYLE[data.aiAnalysis.severity] ?? SEVERITY_STYLE.moderate;

                    const disasterType = DISASTER_ICON[data.disasterType] ?? { icon: AlertTriangle, iconColor: 'text-muted-foreground' };

                    return (

                        <Card key={data.id} className="group overflow-hidden border-border/70 bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                            <div className="relative h-44 overflow-hidden cursor-pointer">

                                <img src={data.media?.[0]?.url} alt={data.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />

                                <div className="absolute inset-0 bg-gradient-to-t  from-slate-950/75  via-slate-950/10 to-transparent" />

                                <div className=" absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-white shadow-sm backdrop-blur-md">
                                    <disasterType.icon className={`h-3.5 w-3.5 ${disasterType.iconColor}`} />
                                    <span className="text-xs font-semibold"> {data.disasterType}</span>
                                </div>

                                <Badge variant="outline" className={`absolute right-4 top-4 rounded-full border px-2.5 py-3 backdrop-blur-md ${statusStyle.badgeClass}`}>
                                    <span className={`mr-0.5 h-2 w-2 rounded-full ${statusStyle.accent}`} /> {statusStyle.label}
                                </Badge>

                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span> {data.location.coordinates.join(', ')} </span>
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

                                <ConfidenceMeter value={data.aiAnalysis.confidence * 100} />

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
                                <Button variant="ghost" className=" ml-auto h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer">
                                    View Details
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>


        </div>
    )
}

export default Reports