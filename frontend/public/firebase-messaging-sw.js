importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyB02WWNGwDVjnQX001OLaY6OizOtD8WpHM",
    authDomain: "disaster-watch-5bdf7.firebaseapp.com",
    projectId: "disaster-watch-5bdf7",
    storageBucket: "disaster-watch-5bdf7.firebasestorage.app",
    messagingSenderId: "1074552763659",
    appId: "1:1074552763659:web:caa48c28a93dd3aa825e0e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || "DisasterWatch Alert";
    const notificationOptions = {
        body: payload.notification.body || "A new Disaster Alert has been Received",
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
