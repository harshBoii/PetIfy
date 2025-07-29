// src/app/api/groups/[id]/join/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Join a group
export async function PUT(request: Request, context: { params: { id:string } }) {
    try {
        const client = await clientPromise;
        const db = client.db(); // REPLACE with your database name
        const id = context.params.id;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid group ID' }, { status: 400 });
        }
        
        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const result = await db.collection('groups').updateOne(
            { _id: new ObjectId(id) },
            { 
                $inc: { members: 1 },
                $addToSet: { memberIds: userId } // Use $addToSet to prevent duplicates
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Successfully joined group' }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}