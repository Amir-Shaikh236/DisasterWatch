import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/config/firebase";
import { toast } from "sonner";
import { Flame, Mountain, Waves, Activity, AlertTriangle } from "lucide-react";
import { shortBody } from "@/utils/Helpers";

export const requestNotificationPermission = async () => {
    try {
        if (!("Notification" in window)) throw new Error("This browser doesn't support notifications.");

        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            toast.message('Notification Permission not granted.');
            return null;
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (!token) return toast.message('Failed to generate FCM Token');

        return token;

    } catch {
        return null;

    }
}

const disasterIcons = {
    flood: Waves,
    wildfire: Flame,
    landslide: Mountain,
    earthquake: Activity
}

export const listenForNotifications = () => {
    return onMessage(messaging, (payload) => {
        const Icon = disasterIcons[payload.data?.disasterType] || AlertTriangle;
        const title = payload.notification?.title || payload.data?.title || "Disaster Alert";
        const body = payload.notification?.body || payload.data?.body || "A Disaster has been reported near You";

        if (Notification.permission === 'granted') {

            toast.custom(
                (toastId) => (
                    <div className="relative w-95 overflow-hidden rounded-lg border border-red-500/30">
                        <div className="p-4 pl-5">

                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <span className="absolute inset-0 animate-ping rounded-lg bg-red-500/30" />
                                    <div className="relative rounded-lg bg-red-500/15 p-2 ring-1 ring-red-500/30">
                                        <Icon className="h-4 w-5 text-red-400" />
                                    </div>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-white">{title}</h3>
                                </div>
                            </div>

                            <div className="w-full">
                                <p className="mt-2 text-sm leading-5 text-slate-300">{shortBody(body, 100)}</p>
                            </div>

                            <div className="mt-3 flex justify-end gap-2">
                                <button onClick={() => toast.dismiss(toastId)}
                                    className="rounded-lg px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 cursor-pointer"
                                >
                                    Dismiss
                                </button>

                                <button
                                    onClick={() => {
                                        toast.dismiss(toastId)
                                        window.location.href = "/alerts";
                                    }}
                                    className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 cursor-pointer"
                                >
                                    View Alert
                                </button>
                            </div>
                        </div>
                    </div>
                ),
                {
                    duration: 10000,
                }
            );
        }
    })
}