// app/api/signup/route.js

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/signup:
 * post:
 * summary: Creates a new user
 * description: Registers a new user in the database with admin privileges.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * email:
 * type: string
 * format: email
 * description: User's email address.
 * password:
 * type: string
 * format: password
 * description: User's password (will be hashed).
 * name:
 * type: string
 * description: User's full name.
 * responses:
 * 201:
 * description: User created successfully.
 * 400:
 * description: Invalid input, missing fields.
 * 409:
 * description: User with this email already exists.
 * 500:
 * description: Server error, could not create user.
 */
export async function POST(request: { json: () => PromiseLike<{ email: any; password: any; name: any; }> | { email: any; password: any; name: any; }; }) {
  let client;

  try {
    const { email, password, name } = await request.json();

    // --- Input Validation ---
    if (!email || !email.includes('@') || !password || password.trim().length < 7 || !name || name.trim() === '') {
      return NextResponse.json({
        message: 'Invalid input. Password should be at least 7 characters long, and all fields are required.',
      }, { status: 400 });
    }

    // --- Database Connection ---
    // It's highly recommended to store your connection string in environment variables.
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      console.error("MongoDB URI not found in environment variables.");
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const usersCollection = db.collection('users');

    // --- Check for Existing User ---
    const existingUser = await usersCollection.findOne({ email: email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists!' }, { status: 409 });
    }

    // --- Hash Password ---
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- Create New User ---
    const result = await usersCollection.insertOne({
      name: name,
      email: email,
      password: hashedPassword,
      is_admin: true, // Set is_admin to true for every new user
      createdAt: new Date(),
    });

    // --- Send Success Response ---
    return NextResponse.json({ message: 'User created successfully!', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Error during user creation:', error);
    // Differentiate between JSON parsing error and other errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Something went wrong, could not create user.' }, { status: 500 });
  } finally {
    // --- Close Database Connection ---
    if (client) {
      await client.close();
    }
  }
}
