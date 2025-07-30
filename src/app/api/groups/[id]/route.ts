// src/app/api/groups/[id]/route.ts

import { NextResponse } from 'next/server';
import getClient from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Make sure this is imported

export async function GET(request: Request, context: { params: { id: string } }) {
    try {
        const client = await getClient;
        const db = client.db("test"); // Using your confirmed DB name

        const id = context.params.id;

        // Check if the ID is a valid ObjectId format before converting
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid group ID format' }, { status: 400 });
        }
        
        // Convert the string ID from the URL into a real ObjectId
        const groupId = new ObjectId(id);

        // Now the query will match the data type in your database
        const group = await db.collection('groups').findOne({ _id: groupId });

        if (!group) {
            return NextResponse.json({ message: 'Group not found' }, { status: 444 });
        }
        
        const messages = await db.collection('messages')
            .find({ groupId: groupId }) // Use the ObjectId here too
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json({ group, messages });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getClient;
    const db = client.db('test');
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid group ID format' },
        { status: 400 }
      );
    }

    const groupId = new ObjectId(id);
    const deleteResult = await db
      .collection('groups')
      .deleteOne({ _id: groupId });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Group not found or already deleted' },
        { status: 404 }
      );
    }

    // Cascade delete messages
    await db.collection('messages').deleteMany({ groupId });

    return NextResponse.json(
      { message: 'Group and associated messages deleted successfully' },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
