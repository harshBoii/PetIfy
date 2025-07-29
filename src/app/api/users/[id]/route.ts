// app/api/users/[id]/route.js

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// GET a single user's details and their pet listings
export async function GET(request, { params }) {
  const { id } = params;
  let client;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid user ID format.' }, { status: 400 });
  }

  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error("MongoDB URI not found in environment variables.");
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }
    client = await MongoClient.connect(MONGO_URI);
    const db = client.db();
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { name: 1, email: 1, _id: 0 } }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const pets = await db.collection('pets').find({ ownerId: id }).toArray();
    const responseData = { ...user, pets };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error fetching user and pets:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

// UPDATE a user's details
export async function PUT(request, { params }) {
    const { id } = params;
    let client;

    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid user ID format.' }, { status: 400 });
    }

    try {
        const { name, email } = await request.json();
        if (!name || !email) {
            return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 });
        }
        
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error("MongoDB URI not found in environment variables.");
            return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
        }
        client = await MongoClient.connect(MONGO_URI);
        const db = client.db();
        
        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { name, email } },
            { returnDocument: 'after', projection: { _id: 1, name: 1, email: 1 } }
        );

        if (!result) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        const updatedUser = { ...result, id: result._id.toString() };
        delete updatedUser._id;

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}


// DELETE a user
export async function DELETE(request, { params }) {
    const { id } = params;
    let client;

    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid user ID format.' }, { status: 400 });
    }

    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error("MongoDB URI not found in environment variables.");
            return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
        }
        client = await MongoClient.connect(MONGO_URI);
        const db = client.db();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}
