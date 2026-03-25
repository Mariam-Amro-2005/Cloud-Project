// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDODNh-BFWI0-QD5jcfSSKTWhh8T91Rr54",
    authDomain: "cloud-project-2026-bcb55.firebaseapp.com",
    projectId: "cloud-project-2026-bcb55",
    storageBucket: "cloud-project-2026-bcb55.firebasestorage.app",
    messagingSenderId: "679872158612",
    appId: "1:679872158612:web:d0015e9e265b153d1b0d81",
    measurementId: "G-R3MZ5MSVZT",
    databaseURL: "https://cloud-project-2026-bcb55-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

export { app, analytics, database, messaging };