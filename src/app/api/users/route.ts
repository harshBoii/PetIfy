// app/api/users/route.js

import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/users:
 * get:
 * summary: Get a list of all users
 * description: Retrieves a list of all users with their public information.
 * responses:
 * 200:
 * description: A list of users.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: string
 * description: The user's unique ID.
 * name:
 * type: string
 * description: The user's name.
 * email:
 * type: string
 * description: The user's email address.
 * 500:
 * description: Server error.
 */
export async function GET(request) {
  let client;

  try {
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      console.error("MongoDB URI not found in environment variables.");
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all users and project only the necessary fields
    // FIX: Removed `password: 0` to resolve the projection error.
    // We only need to specify the fields to include.
    const users = await usersCollection.find({}, {
      projection: {
        _id: 1,
        name: 1,
        email: 1,
      }
    }).toArray();

    // Map the '_id' field to 'id' for consistency
    const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
    }));

    return NextResponse.json(formattedUsers, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
