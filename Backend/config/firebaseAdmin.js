import admin from 'firebase-admin'

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJEECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
export const messaging = admin.messaging();