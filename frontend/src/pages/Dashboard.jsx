import DisasterActivity from "@/components/shared/DisasterActivity";
import DisasterMap from "@/components/shared/DisasterMap";
import DisasterType from "@/components/shared/DisasterType";
import ImageAnalysisModal from "@/components/shared/ImageAnalysis";
import ReportModal from "@/components/shared/ReportModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAlerts } from "@/store/useAlerts";
import { useReports } from "@/store/useReports";
import { shortBody } from "@/utils/Helpers";
import { AlertTriangle, ArrowUpRight, Camera, FileText, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [isImageAnalyzerOpen, setIsImageAnalyzerOpen] = useState(false)

    const reports = useReports((state) => state.reports)
    const alerts = useAlerts((state) => state.alerts)

    const TotalStats = [
        {
            name: "Total Reports",
            length: reports.length,
            icon: FileText,
            iconClass: "text-blue-400"
        },

        {
            name: "Active Alerts",
            length: alerts.length,
            icon: AlertTriangle,
            iconClass: "text-destructive animate-pulse"
        },

        {
            name: "Critical Alerts",
            length: alerts.filter((data) => data.severity === 'critical').length,
            icon: TrendingUp,
            iconClass: "text-amber-300"
        },
    ];

    const criticalAlert = alerts.find((alert) => alert.severity === 'high');

    return (
        <div className="min-h-full w-full flex-1 bg-background p-6 lg:p-8">
            <div className="overflow-auto flex items-center justify-between">

                <div className="flex-1 items-center">
                    <h1 className="text-2xl font-bold tracking-tight"> Welcome Back </h1>
                    <h1 className="text-md text-muted-foreground">  Here's what's happening across the disaster monitoring network. </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <div>
                        <Button onClick={() => setIsImageAnalyzerOpen(true)} variant="outline" className="flex items-center cursor-pointer rounded-lg bg-black px-4" size="lg">
                            <Camera className="h-4 w-4" />
                            <span> Image Analyzer </span>
                        </Button>
                    </div>

                    <div>
                        <Button onClick={() => setIsReportModalOpen(true)} variant="outline" className="flex items-center cursor-pointer rounded-lg bg-black px-4" size="lg">
                            <Plus className="h-4 w-4" />
                            <span> Submit Report </span>
                        </Button>
                    </div>
                </div>

            </div>

            <div className="mb-8 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {TotalStats.map((item) => {
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

            <Separator className="mt-2 mb-5" />

            {criticalAlert ? (
                <>
                    <div>
                        <h1 className="text-xl font-bold"> Critical Alert Near You </h1>
                    </div>

                    <div className="bg-red-500/10 rounded-lg flex items-center justify-between mt-3 border border-red-500/25 p-6 cursor-pointer hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 hover:scale-101">
                        <div className="flex items-center justify-around space-x-3">

                            <div className="flex items-center justify-center rounded-md shrink-0 border h-11 w-11 border-red-500/25 bg-red-500/10">
                                <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                            </div>

                            <div>
                                <h1 className="font-semibold"> {criticalAlert.title} </h1>
                                <span className="text-sm text-muted-foreground"> {shortBody(criticalAlert.description, 280)} </span>
                            </div>

                        </div>

                        <Button variant="outline" className="cursor-pointer shrink-0 text-red-300 hover:text-red-200 bg-red-500/5 hover:bg-red-500/10 border-red-500/30 hover:border-red-500/50">
                            <Link to="/alerts"> View Details </Link>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <h1 className="text-lg font-semibold"> Critical Alert Near You  </h1>
                    </div>

                    <div className="bg-emerald-500/10 rounded-lg flex items-center justify-between mt-3 border border-emerald-500/25 p-6 cursor-pointer hover:emerald-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5 hover:scale-101">
                        <div className="flex items-center justify-around space-x-3">

                            <div className="flex items-center justify-center rounded-md shrink-0 border h-11 w-11 border-emerald-500/25 bg-emerald-500/10">
                                <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
                            </div>

                            <div>
                                <h1 className="font-semibold"> No Critical Alert Found Near You </h1>
                                <span className="text-sm text-muted-foreground"> You Can Check Out All Alerts Instead </span>
                            </div>

                        </div>

                        <Button variant="outline" className="cursor-pointer shrink-0 text-emerald-300 hover:text-emerald-200 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50">
                            <Link to="/alerts"> View Details </Link>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </>
            )}

            <Separator className="mt-5 mb-5" />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DisasterType />
                <DisasterActivity />
            </div >

            <div>
                <DisasterMap />
            </div>

            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
            <ImageAnalysisModal isOpen={isImageAnalyzerOpen} onClose={() => setIsImageAnalyzerOpen(false)} />
        </div >
    )
}