import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/config/firebase";
import { toast } from "sonner";

export const requestNotificationPermission = async () => {
    try {
        if (!("Notification" in window)) throw new Error("This browser doesn't support notifications.");

        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            toast.message('Notification Permission not granted.');
            return null;
        }

        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
        console.log("FCM Service Worker Registered: ", registration)

        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (!token) return toast.message('Failed to generate FCM Token');

        return token;

    } catch (error) {
        console.error('Failed to Initialize notifications', error)
        return null;

    }
}

export const listenForNotifications = () => {
    return onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || "Disaster Alerrt"
        const body = payload.notification?.body || payload.data?.body || "A Disaster has been reported near You"

        if (Notification.permission === 'granted') {

            toast.custom(
                (toastId) => (
                    <div className="w-95 rounded-xl border border-teal-400/20 bg-[#00282c] p-4 shadow-2xl">

                        <h3 className="text-sm font-semibold text-white"> {title} </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300"> {body} </p>

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => toast.dismiss(toastId)} className="rounded-lg px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">
                                Dismiss
                            </button>

                            <button
                                onClick={() => {
                                    toast.dismiss(toastId);
                                    window.location.href = "/alerts";
                                }}
                                className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-400"
                            >
                                View Alert
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: 10000,
                    position: "top-right",
                }
            );
        }
    })
}