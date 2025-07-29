// src/app/api/groups/[id]/messages/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Send a new message
export async function POST(request: Request, context: { params: { id: string } }) {
    try {
        const client = await clientPromise;
        const db = client.db("test"); // <-- FIX #1: Use the correct DB name

        const id = context.params.id; // <-- FIX #2: Get id from context

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid group ID' }, { status: 400 });
        }

        const body = await request.json();
        const { user, userId, message, avatar } = body;

        const newMessage = {
            groupId: new ObjectId(id),
            user,
            userId,
            message,
            avatar,
            createdAt: new Date(),
        };

        const result = await db.collection('messages').insertOne(newMessage);
        return NextResponse.json(result, { status: 201 });
    } catch (e) {
        console.error("Error sending message:", e);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}