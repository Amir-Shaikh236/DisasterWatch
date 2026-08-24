import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useState } from "react";


export default function Setting() {
    const [isSharing, setIsSharing] = useState(false)
    const [loading] = useState(false)

    const handleSharing = (checked) => {
        setIsSharing(checked)
    }

    return (
        <div className="min-h-screen flex-1 bg-background p-6 text-foreground lg:p-9">
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10 ring-1 ring-primary/20">
                        <Settings className="h-8 w-8 text-primary" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl"> Settings </h1>
                        <p className="text-sm text-muted-foreground lg:text-base">
                            Manage your account settings and preferences here.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="flex-row items-center justify-between rounded-lg border border-border bg-transparent p-5 shadow-md">
                <CardHeader className="min-w-0 flex-1 p-0">
                    <CardTitle> Location Sharing </CardTitle>
                    <CardDescription className="hidden text-muted-foreground sm:block"> Enable or disable location sharing for real-time Notification. </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-2 pt-6">
                    <Switch checked={isSharing} onCheckedChange={handleSharing} disabled={loading} className="cursor-pointer" />
                    <Label className={`hidden sm:block ${isSharing ? "text-green-600" : "text-red-600"}`}>
                        {isSharing ? "Sharing Enabled" : "Sharing Disabled"}
                    </Label>
                </CardContent>
            </Card>
        </div>
    )
}

