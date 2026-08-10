import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowUpRight, Camera, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="bg-background p-4 mt-4">
            <div className="overflow-auto flex justify-between">
                <div className="flex items-center">
                    <h1 className="text-2xl"> Real-time Overview Of All Activities </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <div>
                        <Button variant="outline" className="flex items-center cursor-pointer rounded-lg bg-black px-4" size="lg">
                            <Camera className="h-4 w-4" />
                            <span> Image Analyzer </span>
                        </Button>
                    </div>

                    <div>
                        <Button variant="outline" className="flex items-center cursor-pointer rounded-lg bg-black px-4" size="lg">
                            <Plus className="h-4 w-4" />
                            <span> Submit Report </span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-red-500/10 rounded-lg flex items-center justify-between mt-6 border border-red-500/25 p-6 cursor-pointer hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/5">
                <div className="flex items-center justify-around space-x-3">

                    <div className="flex items-center justify-center rounded-md shrink-0 border h-11 w-11 border-red-500/25 bg-red-500/10">
                        <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                    </div>

                    <div>
                        <h1 className="font-semibold"> Critical Wildfire Alert: Intense Wildfire Near JW Marriott Pune. </h1>
                        <span className="text-sm text-muted-foreground">A massive and intense wildfire is actively burning across a wide area of trees and dry vegetation, with firefighters visible against towering flames.</span>
                    </div>

                </div>

                <Button variant="outline" className="cursor-pointer shrink-0 text-red-300 hover:text-red-200 bg-red-500/5 hover:bg-red-500/10 border-red-500/30 hover:border-red-500/50">
                    <Link to="/alerts"> View Details </Link>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            <Separator className="mt-5 mb-5" />
        </div>
    )
}