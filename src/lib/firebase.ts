import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDODNh-BFWI0-QD5jcfSSKTWhh8T91Rr54",
  authDomain: "cloud-project-2026-bcb55.firebaseapp.com",
  databaseURL: "https://cloud-project-2026-bcb55-default-rtdb.firebaseio.com",
  projectId: "cloud-project-2026-bcb55",
  storageBucket: "cloud-project-2026-bcb55.firebasestorage.app",
  messagingSenderId: "679872158612",
  appId: "1:679872158612:web:d0015e9e265b153d1b0d81",
  measurementId: "G-R3MZ5MSVZT"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, db, messaging, getToken, onMessage, ref, push, onValue };
