importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-database-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDODNh-BFWI0-QD5jcfSSKTWhh8T91Rr54",
  authDomain: "cloud-project-2026-bcb55.firebaseapp.com",
  databaseURL: "https://cloud-project-2026-bcb55-default-rtdb.firebaseio.com",
  projectId: "cloud-project-2026-bcb55",
  storageBucket: "cloud-project-2026-bcb55.firebasestorage.app",
  messagingSenderId: "679872158612",
  appId: "1:679872158612:web:d0015e9e265b153d1b0d81",
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated and claimed control!');
});

const messaging = firebase.messaging();
const db = firebase.database();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || '';

  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon.ico'
  };
  const username = "user_" + (payload.data?.username || "guest");
  console.log("Username: ", username);
  console.log(payload.data)

  db.ref(`notifications/${username}`).push({
    title: notificationTitle,
    body: notificationBody,
    receivedAt: Date.now()
  }).catch((error) => {
    console.error('Failed to update DB in background:', error);
  });

  self.registration.showNotification(notificationTitle, notificationOptions);
});
