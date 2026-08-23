import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let messaging = null

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY
}

const isValidAccount = Object.values(serviceAccount).every((value) => typeof value === "string" && value.trim() !== "");

if (isValidAccount) {
    const firebaseAdmin = initializeApp({ credential: cert(serviceAccount) });
    messaging = getMessaging(firebaseAdmin);
}

export { messaging };