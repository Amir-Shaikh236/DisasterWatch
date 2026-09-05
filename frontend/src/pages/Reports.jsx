import { Separator } from "@/components/ui/separator"
import { Activity, AlertTriangle, ArrowUpRight, Clock3, FileText, Flame, MapPin, Mountain, ShieldCheck, Waves, Verified, ScanSearch, ShieldQuestion, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatDisasterType } from "@/utils/Helpers";
import ReportModal from "@/components/shared/ReportModal";
import { useReports } from "@/store/useReports";
import { useUser } from "@/store/useUser";
import { deleteReport } from "@/api/reportApi";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/shared/ConfirmDialog";

export default function Reports() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedReportId, setSelectedReportId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false);
    const reports = useReports((state) => state.reports)
    const isLoading = useReports((state) => state.isLoading)
    const user = useUser((state) => state.user)
    const admin = user?.role === "admin" ? true : false;

    const TotalReports = [
        { name: 'Total Reports', length: reports.length, icon: FileText, iconClass: 'text-blue-400' },
        { name: 'Verified', length: reports.filter((report) => report.status === 'verified').length, icon: Verified, iconClass: 'text-primary' },
        { name: 'Under Investigation', length: reports.filter((report) => report.status === 'investigating').length, icon: ScanSearch, iconClass: 'text-amber-400' },
        { name: 'Unverified', length: reports.filter((report) => report.status === 'rejected').length, icon: ShieldQuestion, iconClass: 'text-muted-foreground' }
    ];

    const STATUS_STYLE = {
        verified: {
            label: "Verified",
            badgeClass: "border-emerald-300/40 bg-emerald-950/85 text-emerald-300 shadow-lg shadow-black/20 backdrop-blur-md",
            accent: "bg-emerald-300",
        },

        investigating: {
            label: "Investigating",
            badgeClass: "border-amber-300/40 bg-amber-950/85 text-amber-400 shadow-lg shadow-black/20 backdrop-blur-md animate-pulse",
            accent: "bg-amber-600",
        },

        rejected: {
            label: "Rejected",
            badgeClass: "border-slate-400/30 bg-slate-950/80 text-slate-300 shadow-lg shadow-black/20 backdrop-blur-md",
            accent: "bg-slate-400",
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

    const handleDelete = async () => {
        try {
            setIsDeleting(true)

            await deleteReport(selectedReportId);

            setDeleteDialogOpen(false)
            setSelectedReportId(null)
            toast.success(`Report Deleted`);

        } catch (error) {
            console.error('Report Deleting Error: ', error)

        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="min-h-full flex-1 bg-background p-6 text-foreground lg:p-9">
            <div className="flex items-center justify-between mb-8">

                <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                        <FileText className="h-8 w-8 text-blue-400" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl"> Your Reports </h1>
                        <p className="text-sm text-muted-foreground lg:text-base">
                            Track and review all the disaster reports you've submitted.
                        </p>
                    </div>
                </div>

                <div>
                    <Button onClick={() => setIsReportModalOpen(true)} variant="outline" className="flex items-center cursor-pointer rounded-lg bg-black px-4" size="lg">
                        <Plus className="h-4 w-4" />
                        <span> Submit Report </span>
                    </Button>
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

            {isLoading && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <Card key={item} className="overflow-hidden border-border/70">
                            <div className="h-44 animate-pulse bg-muted" />
                            <CardContent className="space-y-4 p-5">
                                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                                <div className="h-px bg-border" />
                                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && reports.length === 0 && (
                <Card className="border-dashed border-border/70 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">No Reports Yet</h3>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            You haven't submitted any disaster reports yet.
                            Once you submit one, it will appear here.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((data) => {
                    const statusStyle = STATUS_STYLE[data.status] ?? STATUS_STYLE.rejected;

                    const disasterType = DISASTER_ICON[data.disasterType?.toLowerCase()] ?? { icon: AlertTriangle, iconColor: 'text-muted-foreground' };

                    const imageUrl = data.media?.[0]?.url;

                    return (

                        <Card key={data._id} className="group overflow-hidden border-border/70 bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                            <div className="relative h-44 overflow-hidden cursor-pointer">

                                {imageUrl ? (
                                    <img src={imageUrl} alt={data.title || "Disaster Report"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-linear-to-t  from-slate-950/80  via-slate-950/10 to-transparent" />

                                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-white shadow-sm backdrop-blur-md">
                                    <disasterType.icon className={`h-3.5 w-3.5 ${disasterType.iconColor}`} />
                                    <span className="text-xs font-semibold"> {formatDisasterType(data.disasterType)}</span>
                                </div>

                                <Badge variant="outline" className={`absolute right-4 top-4 rounded-full border px-2.5 py-3 backdrop-blur-md ${statusStyle.badgeClass}`}>
                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.accent}`} /> {statusStyle.label}
                                </Badge>

                                {data.location?.address && (
                                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span> {data.location.address} </span>
                                    </div>
                                )}

                            </div>

                            <CardContent className="space-y-4 p-5">
                                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground"> {data.description} </p>

                                <div className="flex items-center justify-between border-t border-border/70 pt-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            <span>Submitted</span>
                                        </div>
                                        <span> {formatDate(data.createdAt)} </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            <span>Updated</span>
                                        </div>
                                        <span> {formatDate(data.updatedAt)} </span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="justify-between border-t border-border/70 bg-muted/10 px-5 py-3">
                                <Button variant="ghost" className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer">
                                    <Link to="/alerts"> View Details </Link>
                                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Button>

                                {admin && (
                                    <Button variant="ghost"
                                        className="ml-auto items-center h-8 gap-1 px-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-destructive cursor-pointer"
                                        onClick={() => {
                                            setSelectedReportId(data._id)
                                            setDeleteDialogOpen(true)
                                        }}>
                                        <Trash2 className="h-4 w-4" />
                                        <span> Delete </span>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
            <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} loading={isDeleting} itemName="REPORT" />
        </div>
    )
}