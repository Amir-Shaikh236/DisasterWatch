import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let messaging = null

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"));

const hasValidServiceAccount = Object.values(serviceAccount).every((value) => typeof value === "string" && value.trim() !== "");

if (hasValidServiceAccount) {
    const firebaseAdmin = initializeApp({ credential: cert(serviceAccount) });
    messaging = getMessaging(firebaseAdmin);
}

export { messaging };