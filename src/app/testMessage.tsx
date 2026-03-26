'use client';

import { useEffect, useState } from 'react';
import { MessagePayload, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebaseApp';

export default function Message() {
    const [notification, setNotification] = useState<MessagePayload | null>(null);

    useEffect(() => {
        // Guard against server‑side execution
        if (typeof window === 'undefined') return;

        // Request permission and set up messaging
        const setupMessaging = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied.');
                    return;
                }

                console.log('Notification permission granted.');

                // Get messaging instance
                const messaging = getMessaging(app);

                // Listen for foreground messages
                onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);
                    setNotification(payload); // Store for UI update
                    // Optional: Show a browser notification even when the app is in foreground
                    if (payload.notification) {
                        new Notification(payload.notification.title || 'New message', {
                            body: payload.notification.body,
                            icon: '/firebase-logo.png', // optional
                        });
                        console.log("Notification: ", payload.notification);
                    };

                    if (payload.data) {
                        console.log("Data Payload: ", payload.data)
                    }
                });

                // Retrieve the FCM token
                const token = await getToken(messaging, {
                    vapidKey: 'BDwVW-d-te72QspUGyyRH-2BFIpox8albsGPKUtdPRznuU1DNfld7rDqQdvzzLPS9qBNm5xZ-nyWAHLxG-c9oQI',
                });
                if (token) {
                    console.log('FCM Token:', token);
                    // Send token to your server
                } else {
                    console.log('No registration token available.');
                }
            } catch (error) {
                console.error('Error setting up messaging:', error);
            }
        };

        setupMessaging();
    }, []); // Runs once on mount

    // Optional: Render the latest notification
    return (
        <div>
            <h1>Message Component</h1>
            <br></br>
            {notification && (
                <div className="notification">
                    <strong>{notification.notification?.title}</strong>
                    <p>{notification.notification?.body}</p>
                </div>
            )}
        </div>
    );
}