import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from '../config/serviceAccountKey.json' with {type: "json"};

const firebaseAdmin = initializeApp({ credential: cert(serviceAccount) });
export const messaging = getMessaging(firebaseAdmin);