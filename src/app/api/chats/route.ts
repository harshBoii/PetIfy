// File: src/app/api/chats/route.ts

import { NextResponse } from 'next/server';
import  clientPromise  from '@/lib/mongodb'; // Assuming your db connection setup

export async function POST(req: Request) {
  try {
    const { buyerId, sellerId, petId } = await req.json();

    // Validate incoming data
    if (!buyerId || !sellerId || !petId) {
      return NextResponse.json({ error: 'Missing required fields: buyerId, sellerId, and petId are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const chatsCollection = db.collection('chats');

    // Check if a chat already exists to avoid duplicates
    const existingChat = await chatsCollection.findOne({
      buyerId,
      sellerId,
      petId,
    });

    // If a chat already exists, return its ID so the user can be redirected there
    if (existingChat) {
      return NextResponse.json({ chatId: existingChat._id.toString() }, { status: 200 });
    }

    // If no chat exists, create a new one
    const newChat = {
      buyerId,
      sellerId,
      petId,
      memberIds: [buyerId, sellerId], // Useful for querying chats for a user
      createdAt: new Date(),
      messages: [], // Initialize with an empty array for messages
    };

    const result = await chatsCollection.insertOne(newChat);

    // Return the ID of the newly created chat
    return NextResponse.json({ chatId: result.insertedId.toString() }, { status: 201 });

  } catch (error) {
    console.error('POST /api/chats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
