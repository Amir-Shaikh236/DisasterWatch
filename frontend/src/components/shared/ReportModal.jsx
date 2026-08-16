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
import { getAddressFromCoordinates } from "@/lib/googleMaps";
import { publicClient } from "@/api/api";

export default function ReportModal({ isOpen, onClose }) {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

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

    const handleGPS = () => {
        if (!navigator.geolocation) return console.error("GeoLocation is not supported.");

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {

                const { latitude, longitude } = position.coords;

                const address = await getAddressFromCoordinates(latitude, longitude);

                form.setValue("location", {
                    type: "Point",
                    coordinates: [longitude, latitude],
                    address: address
                },
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );
            } catch (error) {
                console.error("Failed to resolve GPS", error);

            } finally {
                setIsLoading(false)

            }

        },
            (error) => {
                console.error("Unable to get Location: ", error);
                setIsLoading(false)
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }

    const handleSubmit = async (data) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("disasterType", data.disasterType);
            formData.append("description", data.description);
            formData.append("location", JSON.stringify(data.location));
            files.forEach((item) => {
                formData.append("images", item.file);
            });

            const response = await publicClient.post('/api/reports/add', formData)
            console.log(response.data.report);

        } catch (error) {
            console.log(error.response?.data || error.message)

        } finally {
            setIsLoading(false);

        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} >
            <DialogContent className="max-w-2xl! max-h-[90vh] overflow-y-auto bg-card border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-card-foreground lg:-mb-2">Submit Disaster Report</DialogTitle>
                    <DialogDescription className="text-muted-foreground"> Your Report helps our AI models detect disasters fasters </DialogDescription>
                </DialogHeader>

                <form className="space-y-6 pt-6" onSubmit={form.handleSubmit(handleSubmit)}>

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
                                    <div className="flex gap-1">
                                        <AutoComplete value={field.value.address} onChange={(text) => field.onChange({ ...field.value, address: text })}
                                            onLocationSelect={(location) => {
                                                console.log("selected: ", location)
                                                form.setValue("location", {
                                                    type: "Point",
                                                    coordinates: [location.coordinates.longitude, location.coordinates.latitude],
                                                    address: location.address
                                                }, { shouldValidate: true });
                                                form.setValue("placeId", location.placeId)
                                            }} />
                                        {isLoading ? <Button type="button" variant="outline" className="rounded-md" disabled> <Loader2 className="h-4 w-4 animate-spin" /> </Button> :
                                            <Button type="button" variant="outline" className="cursor-pointer rounded-md" onClick={handleGPS}> <MapPin className="h-4 w-4" /> GPS </Button>
                                        }
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </div>
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

                    <DialogFooter className="flex items-center justify-between">
                        <div>
                            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => handleClose()} disabled={isLoading}> Cancel </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="cursor-pointer px-4" onClick={handleReset} disabled={isLoading}>Reset</Button>
                            {isLoading ? <Button type="button" variant="outline" className="rounded-md" disabled> <Loader2 className="h-4 w-4 animate-spin" />Submiting... </Button> :
                                <Button type="submit" variant="secondary" className="cursor-pointer">Submit</Button>}
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    )
}

