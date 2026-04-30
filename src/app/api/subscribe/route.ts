import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.PROJECT_ID,
                clientEmail: process.env.CLIENT_EMAIL,
                privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export async function POST(req: Request) {
    try {
        const { token, topic } = await req.json();

        if (!token || !topic) {
            return NextResponse.json(
                { error: 'Token and topic are required' },
                { status: 400 }
            );
        }

        // Subscribe the device token to the requested topic
        const response = await admin.messaging().subscribeToTopic(token, topic);

        return NextResponse.json({
            success: true,
            message: `Successfully subscribed token to topic: ${topic}`,
            response
        });
    } catch (error: any) {
        console.error('Error subscribing to topic:', error);
        return NextResponse.json(
            { error: error?.message || 'Server Error' },
            { status: 500 }
        );
    }
}
