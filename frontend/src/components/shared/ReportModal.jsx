import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import AutoComplete from "@/components/shared/location/AutoComplete";
import { privateClient } from "@/api/api";
import { toast } from "sonner";
import { GPSLocation } from "@/utils/Helpers";
import { useNavigate } from "react-router-dom";

export default function ReportModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const navigate = useNavigate()

    const reportSchema = z.object({
        disasterType: z.enum(["earthquake", "flood", "landslide", "wildfire"]),
        description: z.string().min(10, "Description must be atleast 10 characters"),
        location: z.object({
            type: z.literal('Point'),
            coordinates: z.array(z.number()).length(2),
            address: z.string().min(1, "please Select a Location")
        }),

        images: z.array(z.instanceof(File)).max(5)
            .refine((files) => files.every((file) => file.type.startsWith("image/")), "Only Images are allowed")
    });

    const form = useForm({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            disasterType: '',
            description: "",
            location: {
                type: "Point",
                coordinates: [],
                address: ""
            },

            images: []
        }
    });

    const handleFiles = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) return;

        const newFiles = selectedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        const updated = [...files, ...newFiles].slice(0, 5);
        setFiles(updated);
        form.setValue("images", updated.map((item) => item.file), { shouldValidate: true });
    }

    const removeFiles = (index) => {
        const updated = files.filter((_, fileIndex) => fileIndex !== index);
        setFiles(updated);
        form.setValue("images", updated.map((item) => item.file), { shouldValidate: true });
    };

    const handleGPS = async () => {
        setIsLocating(true);
        const location = await GPSLocation();
        setIsLocating(false);

        if (!location) return;

        form.setValue("location", {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
            address: location.address
        }, { shouldValidate: true });
    }


    const handleReset = () => {
        files.forEach((item) => {
            URL.revokeObjectURL(item.preview)
        });
        setFiles([]);
        form.reset();
    };

    const handleClose = () => {
        handleReset();
        onClose();
    }

    const handleSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("disasterType", data.disasterType);
            formData.append("description", data.description);
            formData.append("location", JSON.stringify(data.location));
            files.forEach((item) => {
                formData.append("images", item.file);
            });

            await privateClient.post('/api/reports/add', formData)
            toast.success("Report Submitted Successfully! Our AI will verify your report and update the status soon.");
            handleClose();
            navigate('/alerts')

        } catch {
            toast.error("Failed to submit report. Please try again.");

        } finally {
            setIsSubmitting(false);

        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} >
            <DialogContent className="max-w-2xl! max-h-[90vh] flex flex-col overflow-hidden bg-card border p-0">
                <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
                    <DialogTitle className="text-xl font-semibold text-card-foreground lg:-mb-2">Submit Disaster Report</DialogTitle>
                    <DialogDescription className="text-muted-foreground"> Your Report helps our AI models detect disasters fasters </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>

                        {/* Disaster Type Selector */}
                        <div className="space-y-2">
                            <Label htmlFor="disasterType" className="font-semibold text-sm" > Disaster Type <span className="text-destructive"> * </span></Label>
                            <Controller name="disasterType" control={form.control} render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="disasterType" className="w-full cursor-pointer rounded-sm p-3"><SelectValue placeholder="Select Disaster Type" /></SelectTrigger>
                                    <SelectContent className="p-1">
                                        <SelectItem value="earthquake" className="cursor-pointer"> Earthquake </SelectItem>
                                        <SelectItem value="flood" className="cursor-pointer"> Flood </SelectItem>
                                        <SelectItem value="wildfire" className="cursor-pointer"> Wildfire </SelectItem>
                                        <SelectItem value="landslide" className="cursor-pointer"> LandSlide </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <FieldGroup>
                                <Controller name="description" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="description" className="text-sm font-semibold"> Description <span className="text-destructive"> * </span></FieldLabel>
                                        <Textarea {...field} id="description" aria-invalid={fieldState.invalid} rows={4} placeholder="Describe what you witnessed..." className="focus-visible:border-primary/60 focus-visible:ring-1" />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <FieldGroup>
                                <Controller name="location" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="location" className="text-sm font-semibold">Location <span className="text-destructive"> * </span></FieldLabel>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AutoComplete value={field.value.address} onChange={(text) => field.onChange({ ...field.value, address: text })}
                                                    onLocationSelect={(location) => {
                                                        form.setValue("location", {
                                                            type: "Point",
                                                            coordinates: [location.coordinates.longitude, location.coordinates.latitude],
                                                            address: location.address
                                                        }, { shouldValidate: true });
                                                        form.setValue("placeId", location.placeId)
                                                    }} />
                                            </div>
                                            {isLocating ? <Button type="button" variant="outline" className="rounded-md shrink-0 w-full sm:w-auto" disabled> <Loader2 className="h-4 w-4 animate-spin" /> </Button> :
                                                <Button type="button" variant="outline" className="cursor-pointer rounded-md shrink-0 w-full sm:w-auto" onClick={handleGPS}> <MapPin className="h-4 w-4" /> GPS </Button>
                                            }
                                        </div>
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )} />
                            </FieldGroup>
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

                        <DialogFooter className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border bg-card px-6 py-4">
                            <Button type="button" variant="outline" className="cursor-pointer w-full sm:w-auto border-border bg-card hover:bg-accent text-muted-foreground" onClick={() => handleClose()} disabled={isSubmitting}> Cancel </Button>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button type="button" variant="outline" className="cursor-pointer px-4 w-full sm:w-auto border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300" onClick={handleReset} disabled={isSubmitting}>Reset</Button>
                                {isSubmitting ? <Button type="button" variant="outline" className="rounded-md w-full sm:w-auto border-primary/30 bg-primary/10 text-primary" disabled> <Loader2 className="h-4 w-4 animate-spin" />Submitting... </Button> :
                                    <Button type="submit" variant="secondary" className="cursor-pointer w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">Submit</Button>}
                            </div>
                        </DialogFooter>

                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

