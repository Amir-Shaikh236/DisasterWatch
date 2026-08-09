import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";

export default function Dashboard() {
    return (
        <div className="bg-background p-4">
            <div className="overflow-auto flex justify-between">
                <div className="flex items-center">
                    <h1 className="text-2xl"> Real-time Overview Of All Activities </h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div>
                        <Button variant="outline" className="flex items-center cursor-pointer rounded" size="lg">
                            <Camera className="h-4 w-4" />
                            <span> Image Analyzer </span>
                        </Button>
                    </div>
                    <div>
                        <Button variant="outline" className="flex items-center cursor-pointer rounded" size="lg">
                            <Plus className="h-4 w-4" />
                            <span> Submit Report </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}