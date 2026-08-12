import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


const DEFAULT_FITLERS = {
    disasterType: [],
    severity: "all",
};

const DISASTER_TYPES = ["earthquake", "flood", "landslide", "wildfire"];

export default function FilterModal({ filters = DEFAULT_FITLERS, onApply, onReset }) {
    const [open, setOpen] = useState(false);
    const [localfilter, setLocalFilters] = useState(filters);

    useEffect(() => {
        if (open) {
            setLocalFilters(filters);
        }
    }, [open, filters]);

    const toggleArrayValue = (key, value) => {
        setLocalFilters((previous) => {
            const currentValues = previous[key];
            const updatedValues = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value];

            return { ...previous, [key]: updatedValues }
        });
    };

    const handleApply = () => {
        onApply(localfilter)
        setOpen(false);
    }


    const handleReset = () => {
        setLocalFilters(DEFAULT_FITLERS);
        onReset?.();
    };

    const ActiveFilters = localfilter.disasterType.length + (localfilter.severity !== "all" ? 1 : 0)


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button variant="outline" className="gap-2 cursor-pointer">
                    <Filter className="h-4 w-4" /> Filter
                    {ActiveFilters > 0 && (
                        <Badge variant="secondary" className="ml-1 rounded-full px-2 text-xs py-0.5"> {ActiveFilters}</Badge>
                    )}
                </Button>
            }
            />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl -mb-3">Filter Alerts</DialogTitle>
                    <DialogDescription> Filter Disaster Alerts Based On Types and Severity</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-semibold"> Disaster Type </h3>
                            <p className="text-xs text-muted-foreground"> Select One or More Disaster Types </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {DISASTER_TYPES.map((type) => (
                                <label key={type} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent">
                                    <Checkbox checked={localfilter.disasterType.includes(type)}
                                        onCheckedChange={() => toggleArrayValue("disasterType", type)}
                                    />
                                    <span className="text-sm font-medium capitalize"> {type} </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold" > Severity </label>
                            <Select value={localfilter.severity} onValueChange={(value) =>
                                setLocalFilters((previous) => ({
                                    ...previous, severity: value
                                }))
                            }>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all"> ALL Severities</SelectItem>
                                    <SelectItem value="critical"> Critical </SelectItem>
                                    <SelectItem value="high"> High </SelectItem>
                                    <SelectItem value="moderate"> Moderate </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={handleReset} className=" cursor-pointer"> <RotateCcw className="h-4 w-4" /> Reset </Button>
                    <Button type="button" className="cursor-pointer" onClick={handleApply}> Apply Filters </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}