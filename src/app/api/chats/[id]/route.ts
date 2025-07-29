// src/app/api/chats/[id]/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // The 'id' from the URL (e.g., '68892bbcd35657c6664c49b1')
    const chatId = params.id;

    // --- REMOVED: Clerk authentication check ---
    // const { userId: currentUserId } = getAuth(req as any);
    // if (!currentUserId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log(`Fetching data for public chat room: ${chatId}`);

    // TODO: Add your logic here to fetch chat data from your database using the chatId
    // For now, we'll return some placeholder data.
    const chatData = {
      id: chatId,
      name: `Public Chat Room ${chatId}`,
      messages: [
        { sender: 'System', text: 'Welcome to the public chat!' },
      ],
    };

    return NextResponse.json(chatData);

  } catch (error) {
    // This will catch database errors or other issues
    console.error(`GET /api/chats/[id] error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const chatId = params.id;
    const body = await req.json();

    // TODO: Add logic here to save the new message to your database
    console.log(`Received message for chat ${chatId}:`, body.text);

    return NextResponse.json({ success: true, message: body });
  
  } catch (error) {
    console.error("POST /api/chats/[id] error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
