import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Activity, AlertTriangle, CalendarDays, Camera, CheckCircle2, Eye, Info, Lightbulb, Loader2, MapPin, ShieldAlert, ShieldCheck, Siren, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { publicClient } from "@/api/api"

export default function ImageAnalysisModal({ isOpen, onClose }) {
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setAnalysisResult(null)
            const newUrl = URL.createObjectURL(selectedFile)
            setPreviewUrl(newUrl)
        }
    }

    const handleReset = () => {
        setFile(null)
        setAnalysisResult(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl("")
    }

    const handleClose = () => {
        handleReset()
        onClose()
    }

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzing(true)

        try {
            const ImageData = new FormData()
            ImageData.append("image", file)

            const response = await publicClient.post('/api/ai/analyze-image', ImageData);
            setAnalysisResult(response.data.analysis);

        } catch (error) {
            console.error(error.response?.data || error.message || "Image Analysis Failed");

        } finally {
            setIsAnalyzing(false)
        }
    }

    const getSeverityVariant = (severity) => {
        switch (severity) {
            case "critical": return "destructive"
            case "high": return "warning"
            case "medium": return "medium"
            default: return "secondary"
        }
    }

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return "text-green-500 dark:text-green-400"
        if (confidence >= 0.6) return "text-yellow-500 dark:text-yellow-400"
        return "text-red-500 dark:text-red-400"
    }

    return (
        <div className="mx-auto w-full py-12">
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-6xl! max-h-[90vh] w-[95vw] overflow-hidden border bg-card p-0">
                    <div className="flex max-h-[90vh] min-h-0 flex-col">
                        <DialogHeader className="shrink-0 px-4 pb-3 pt-4">

                            <DialogTitle className="flex items-center space-x-2 text-card-foreground -mb-1">
                                <Camera className="h-5 w-5 text-primary" />
                                <span>Advanced Image Analysis</span>
                            </DialogTitle>

                            <DialogDescription className="text-muted-foreground">
                                Upload an image to detect potential disasters using AI.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4">
                            {!file && (
                                <div className="min-h-70 flex-1 items-center justify-center">
                                    <div className="w-full max-w-6xl">
                                        <div className="flex flex-col items-center justify-center h-70 rounded-lg border-2 border-dashed border-border p-8 text-center">
                                            <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                                            <p className="mb-2 text-muted-foreground">Select an Image to Analyze</p>
                                            <Input type="file" accept="image/*" className="hidden" id="image" onChange={handleFileChange} />
                                            <Button type="button" size="lg" variant="outline" className="cursor-pointer" onClick={() => document.getElementById("image")?.click()}>
                                                Choose Image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {file && (
                                <div className="flex h-full min-h-0 flex-col gap-5 lg:flex-row">
                                    <div className={`min-h-0 transition-all duration-500 ease-in-out ${analysisResult ? "lg:w-40" : "w-full"}`}>
                                        <div className="relative flex h-full min-h-75 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                            <img src={previewUrl} alt="Preview" className={`w-full object-contain transition-all duration-500 ease-in-out ${analysisResult ? "max-h-[65vh]" : "min-h-[70vh]"}`} />
                                            {!analysisResult && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                                    <Button className="cursor-pointer px-6 py-3 text-base shadow-lg transition-transform duration-200 hover:scale-105"
                                                        onClick={handleAnalyze}>
                                                        {isAnalyzing ? <> <Loader2 className="mr-1 h-6 w-6 animate-spin" /> Analyzing.... </> : <> <Activity className="h-4 w-4 mr-2" /> Analyze Image </>}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {analysisResult && (
                                        <div className="min-h-0 flex-1 overflow-y-auto pr-1 transition-all duration-500 ease-in-out lg:w-[60%]">
                                            <div className="space-y-5">
                                                <div className="sticky top-0 z-10 rounded-xl border bg-background/90 px-4 py-3 backdrop-blur-sm">
                                                    <div className="mb-2 flex items-center justify-center gap-2">
                                                        <Activity className="h-5 w-5 text-primary" />
                                                        <h3 className="text-xl font-semibold text-foreground">AI Analysis Results</h3>
                                                    </div>
                                                    <p className="text-center text-sm text-muted-foreground">
                                                        AI-powered visual analysis of the submitted image
                                                    </p>
                                                </div>

                                                <div className={`relative overflow-hidden rounded-xl border p-5 ${analysisResult.isDisaster ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${analysisResult.isDisaster ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                                                            {analysisResult.isDisaster ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="font-semibold text-foreground">
                                                                    {analysisResult.isDisaster ? "Potential Disaster Detected" : "No Disaster Detected"}
                                                                </h4>

                                                                {analysisResult.isRealPhoto !== undefined && (
                                                                    <Badge variant="outline" className={analysisResult.isRealPhoto ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}>
                                                                        {analysisResult.isRealPhoto ? "Authentic Photo" : "Possibly Manipulated"}
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                                                {analysisResult.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {analysisResult.isDisaster && (
                                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div className="rounded-lg border bg-background/50 p-3">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Disaster Type</p>
                                                                <p className="mt-1 font-semibold capitalize text-foreground">{analysisResult.disasterType || "Unknown"}</p>
                                                            </div>

                                                            <div className="rounded-lg border bg-background/50 p-3">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Severity</p>
                                                                <div className="mt-1">
                                                                    <Badge variant={getSeverityVariant(analysisResult.severity)} className="capitalize">
                                                                        {analysisResult.severity || "Low"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="rounded-xl border bg-card p-5">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                                            <span className="text-sm font-semibold text-foreground">AI Confidence</span>
                                                        </div>

                                                        <span className={`text-lg font-bold tabular-nums ${getConfidenceColor(analysisResult.confidence)}`}>
                                                            {(analysisResult.confidence * 100).toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    <Progress value={analysisResult.confidence * 100} className="h-2.5" />

                                                    {analysisResult.confidenceReasoning && (
                                                        <div className="mt-3 flex gap-2 rounded-lg bg-muted/50 p-3">
                                                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                                {analysisResult.confidenceReasoning}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                    {analysisResult.location && (
                                                        <div className="rounded-xl border bg-card p-4">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <MapPin className="h-4 w-4" />
                                                                <span className="text-xs font-medium uppercase tracking-wide">Location</span>
                                                            </div>
                                                            <p className="mt-2 text-sm font-medium text-foreground">{analysisResult.location}</p>
                                                        </div>
                                                    )}

                                                    {analysisResult.areaType && (
                                                        <div className="rounded-xl border bg-card p-4">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Eye className="h-4 w-4" />
                                                                <span className="text-xs font-medium uppercase tracking-wide">Area Type</span>
                                                            </div>
                                                            <p className="mt-2 text-sm font-medium capitalize text-foreground">{analysisResult.areaType}</p>
                                                        </div>
                                                    )}

                                                    {analysisResult.estimatedDate && (
                                                        <div className="rounded-xl border bg-card p-4">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <CalendarDays className="h-4 w-4" />
                                                                <span className="text-xs font-medium uppercase tracking-wide">Estimated Date</span>
                                                            </div>
                                                            <p className="mt-2 text-sm font-medium text-foreground">{analysisResult.estimatedDate}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {analysisResult.keyIndicators?.length > 0 && (
                                                    <div className="rounded-xl border bg-card p-5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Eye className="h-4 w-4 text-primary" />
                                                            <h4 className="text-sm font-semibold text-foreground">Key Visual Indicators</h4>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {analysisResult.keyIndicators.map((indicator, index) => (
                                                                <Badge key={index} variant="secondary" className="px-3 py-1 text-xs font-medium">
                                                                    {indicator}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {analysisResult.potentialImpact && (
                                                        <div className="rounded-xl border bg-card p-5">
                                                            <div className="mb-3 flex items-center gap-2">
                                                                <Siren className="h-4 w-4 text-destructive" />
                                                                <h4 className="text-sm font-semibold text-foreground">Potential Impact</h4>
                                                            </div>
                                                            <p className="text-sm leading-relaxed text-muted-foreground">{analysisResult.potentialImpact}</p>
                                                        </div>
                                                    )}

                                                    {analysisResult.recommendedActions?.length > 0 && (
                                                        <div className="rounded-xl border bg-card p-5">
                                                            <div className="mb-3 flex items-center gap-2">
                                                                <Lightbulb className="h-4 w-4 text-primary" />
                                                                <h4 className="text-sm font-semibold text-foreground">Recommended Actions</h4>
                                                            </div>

                                                            <ul className="space-y-2">
                                                                {analysisResult.recommendedActions.map((action, index) => (
                                                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                                        <span>{action}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="rounded-xl border bg-card p-5">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {analysisResult.misinformationScore >= 0.5 ? (
                                                                <ShieldAlert className="h-4 w-4 text-destructive" />
                                                            ) : (
                                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                            )}
                                                            <span className="text-sm font-semibold text-foreground">Misinformation Risk</span>
                                                        </div>

                                                        <span className={`text-sm font-bold ${analysisResult.misinformationScore >= 0.5 ? "text-destructive" : "text-primary"}`}>
                                                            {(analysisResult.misinformationScore * 100).toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    <Progress value={analysisResult.misinformationScore * 100} className="h-2" />

                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Higher scores indicate a greater likelihood that the submitted image or information may be misleading.
                                                    </p>
                                                </div>

                                                {analysisResult.flags?.length > 0 && (
                                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                            <h4 className="text-sm font-semibold text-foreground">Verification Flags</h4>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {analysisResult.flags.map((flag, index) => (
                                                                <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {flag.code}
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                                            {flag.message}
                                                                        </p>

                                                                        {flag.estimatedDate && (
                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                Estimated date: {flag.estimatedDate}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-4 py-3">
                                                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                                                    <p className="text-xs text-muted-foreground">
                                                        AI analysis is intended to assist verification and should not replace confirmation from official emergency sources.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
