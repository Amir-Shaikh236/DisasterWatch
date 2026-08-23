import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let messaging = null;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (serviceAccountBase64) {
    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf8"));
        const serviceAccountvalues = Object.values(serviceAccount || []);

        const isValidAccount = serviceAccountvalues.length > 0 && serviceAccountvalues.every((value) => typeof value === 'string' && value.trim() !== "");

        if (isValidAccount) {
            const firebaseAdmin = initializeApp({ credential: cert(serviceAccount) });
            messaging = getMessaging(firebaseAdmin);
        }
    } catch {
        messaging = null;
    }
}

export { messaging };