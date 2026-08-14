import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { MapPin, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "../ui/attachment";

export default function ReportModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);

    const handleFiles = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return;

        const newFiles = selectedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }

    const removeFiles = (index) => {
        setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
    }


    const handleReset = () => {
        files.forEach((item) => {
            URL.revokeObjectURL(item.preview)
        });
        setFiles([]);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} >
            <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto bg-card border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-card-foreground lg:-mb-2">Submit Disaster Report</DialogTitle>
                    <DialogDescription className="text-muted-foreground"> Your Report helps our AI models detect disasters fasters </DialogDescription>
                </DialogHeader>

                <form className="space-y-6 pt-6">
                    {/* Disaster Type Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="disasterType" className="font-semibold text-sm" > Disaster Type <span className="text-destructive"> * </span></Label>
                        <Select>
                            <SelectTrigger id="disasterType" className="w-full cursor-pointer rounded-sm p-3"><SelectValue placeholder="Select Disaster Type" /></SelectTrigger>
                            <SelectContent className="p-1">
                                <SelectItem value="earthquake" className="cursor-pointer"> Earthquake </SelectItem>
                                <SelectItem value="flood" className="cursor-pointer"> Flood </SelectItem>
                                <SelectItem value="wildfire" className="cursor-pointer"> Wildfire </SelectItem>
                                <SelectItem value="landslide" className="cursor-pointer"> LandSlide </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold"> Description <span className="text-destructive"> * </span></Label>
                        <Textarea id="description" rows={4} placeholder="Describe what you witnessed..." className="focus-visible:border-primary/60 focus-visible:ring-1" ></Textarea>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Location <span className="text-destructive"> * </span></Label>
                        <div className="flex gap-1">
                            <Input id="location" type="text" placeholder="Enter Location or use GPS" className="w-full focus-visible:border-primary/60 focus-visible:ring-1" />
                            <Button type="button" variant="outline" className="shrink-0 cursor-pointer"> <MapPin /> GPS </Button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold"> Upload Media <span className="ml-1 text-xs font-normal text-muted-foreground">({files.length}/5 Files)</span> </Label>
                        {files.length < 5 && (
                            <div className="border-2  rounded-lg border-dashed border-border p-6 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="mb-2 text-muted-foreground"> Drag & Drop or Click to Upload </p>
                                <Input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
                                <Button type="button" variant="outline" size="sm" className="cursor-pointer"> Choose Files </Button>
                            </div>
                        )}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                {files.map((item, index) => (
                                    <Attachment key={item.preview}>
                                        <AttachmentMedia><img src={item.preview} alt={item.file.name} className="object-cover h-full w-full" /> </AttachmentMedia>
                                        <AttachmentContent>
                                            <AttachmentTitle>{item.file.name}</AttachmentTitle>
                                            <AttachmentDescription>{(item.file.size / 1024 / 1024).toFixed(2)} MB </AttachmentDescription>
                                        </AttachmentContent>
                                        <AttachmentActions>
                                            <AttachmentAction aria-label={`Remove ${item.file.name}`} onClick={() => removeFiles(index)} className="cursor-pointer"> <X className="h-4 w-4" /> </AttachmentAction>
                                        </AttachmentActions>
                                    </Attachment>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex items-center justify-between">
                        <div>
                            <Button variant="outline" className="cursor-pointer" onClick={() => handleClose()}> Cancel </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="cursor-pointer px-4" onClick={handleReset}>Reset</Button>
                            <Button type="submit" variant="secondary" className="cursor-pointer">Submit</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

