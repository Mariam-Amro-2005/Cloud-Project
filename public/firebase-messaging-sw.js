// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

// Initialize Firebase with your app config.
firebase.initializeApp({
    apiKey: "AIzaSyDODNh-BFWI0-QD5jcfSSKTWhh8T91Rr54",
    authDomain: "cloud-project-2026-bcb55.firebaseapp.com",
    projectId: "cloud-project-2026-bcb55",
    storageBucket: "cloud-project-2026-bcb55.firebasestorage.app",
    messagingSenderId: "679872158612",
    appId: "1:679872158612:web:d0015e9e265b153d1b0d81",
    measurementId: "G-R3MZ5MSVZT",
    databaseURL: "https://cloud-project-2026-bcb55-default-rtdb.firebaseio.com"
});

// Retrieve an instance of Firebase Messaging.
const messaging = firebase.messaging();

// Handle background messages.
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // optional
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});