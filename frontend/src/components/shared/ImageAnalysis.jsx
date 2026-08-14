import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Camera, Upload } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"


export default function ImageAnalysisModal({ isOpen, onClose }) {
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file)
            setAnalysisResult(null);
            const Url = URL.createObjectURL(file);
            setPreviewUrl(Url);
        }
    }


    const handleReset = () => {
        setFile(null);
        setAnalysisResult(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("")
    }

    const handleClose = () => {
        handleReset()
        onClose();
    }

    return (
        <div className="mx-auto w-full py-12">
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} >
                <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-hidden bg-card border ">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-card-foreground space-x-2 -mb-1">
                            <Camera className="h-5 w-5 text-primary" />
                            <span> Advanced Image Analysis </span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground"> Upload an image to detect potential disasters using AI.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {!file && (
                            <div>
                                <Label className="text-muted-foreground"> Upload Image for Analysis </Label>
                                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                                    <Upload className="mx-auto w-8 h-8  text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground mb-2"> Select an Image to Analyze </p>
                                    <Input type="file" accept="image/*" className="hidden" id="image" onChange={handleFileChange} />
                                    <Button type="button" variant="outline" className="cursor-pointer" onClick={() => document.getElementById('image')?.click()} >Choose Image</Button>
                                </div>
                            </div>
                        )}

                        {previewUrl && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-contain rounded-lg border bg-muted" />
                                    {!analysisResult && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                            <Button className='cursor-pointer'>Analyze Image</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
