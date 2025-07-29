// src/app/api/users/[id]/notifications/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';


// Ensure your MongoDB URI is in your environment variables
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}



export async function POST(
  req: Request, 
  { params }: { params: { id: string } }
) {
  let client;
  try {
    // Establish connection to the database
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(); // Or client.db("your_db_name") if you need to specify
    
    const usersCollection = db.collection('users');

    const sellerId = params.id;
    const body = await req.json();

    // Manually create the notification object
    // This is where a schema would normally enforce structure
    const newNotification = {
      _id: new ObjectId(), // Generate a unique ID for the notification
      message: body.message,
      fromid: body.fromid,
      petId: body.petId,
      isRead: false,
      createdAt: new Date(),
    };

    // Find the user by their ID and push the notification into their array
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(sellerId) }, // Convert string ID to MongoDB ObjectId
      { 
        $push: { notifications: newNotification } 
      }
    );

    // Check if the user was found and updated
    if (result.matchedCount === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ success: true, notification: newNotification });

  } catch (error) {
    console.error("[NOTIFICATIONS_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    // Ensure the client is closed when the operation is finished
    if (client) {
      await client.close();
    }
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const usersCollection = db.collection('users');

    const id = params.id;

    // Find the user and project to return only the notifications field
    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { notifications: 1, _id: 0 } }
    );

    if (!user) {
      console.log("NO user")
      return new NextResponse("User not found", { status: 454 });
    }

    // Return the notifications array, or an empty array if it doesn't exist
    return NextResponse.json(user.notifications || []);

  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
