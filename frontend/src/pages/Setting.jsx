import { privateClient } from "@/api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { requestNotificationPermission } from "@/services/notification";
import { useUser } from "@/store/useUser";
import { GPSLocation } from "@/utils/Helpers";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Setting() {
    const [loading, setLoading] = useState(false);

    const user = useUser((state) => state.user);
    const setUser = useUser((state) => state.setUser);
    const sharingEnabled = Boolean(user?.notification);

    const enableNotification = async () => {
        const token = await requestNotificationPermission();

        if (!token) {
            throw new Error("Notification permission was denied.");
        }

        let location;
        try {
            const gpsLocation = await GPSLocation();

            if (!gpsLocation) {
                throw new Error('Location access is required to enable proximity alerts.');
            }

            location = {
                type: 'Point',
                coordinates: [gpsLocation.longitude, gpsLocation.latitude],
                address: gpsLocation.address,
            };

        } catch {
            throw new Error('Location access is required to enable proximity alerts.');

        }

        await privateClient.post('/api/auth/user/update', {
            token,
            notification: true,
            location,
        });

        toast.success('Proximity Alert Enabled');
    };

    const disableNotification = async () => {
        await privateClient.post('/api/auth/user/update', {
            notification: false,
            location: null,
            token: null,
        });

        toast.success('Proximity Alert Disabled');
    };

    const handleSharing = async (checked) => {
        if (!user) {
            toast.error('User data is not loaded yet.');
            return;
        }

        setLoading(true);

        try {
            if (checked) {
                await enableNotification();

            } else {
                await disableNotification();

            }
            setUser({ ...user, notification: checked });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update notification settings.');

        } finally {
            setLoading(false);

        }
    };

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
                    <Switch checked={sharingEnabled} onCheckedChange={handleSharing} disabled={loading} className="cursor-pointer" />
                    <Label className={`hidden sm:block ${sharingEnabled ? "text-green-600" : "text-red-600"}`}>
                        {sharingEnabled ? "Sharing Enabled" : "Sharing Disabled"}
                    </Label>
                </CardContent>
            </Card>
        </div>
    );
}

