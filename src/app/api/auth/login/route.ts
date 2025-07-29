// app/api/login/route.js

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/login:
 * post:
 * summary: Authenticates a user
 * description: Logs in a user by verifying their email and password.
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
 * description: User's password.
 * responses:
 * 200:
 * description: Login successful.
 * 400:
 * description: Invalid input, missing fields.
 * 401:
 * description: Unauthorized, invalid credentials.
 * 500:
 * description: Server error, could not process login.
 */
export async function POST(request: { json: () => PromiseLike<{ email: any; password: any; }> | { email: any; password: any; }; }) {
  let client;

  try {
    const { email, password } = await request.json();

    // --- Input Validation ---
    if (!email || !email.includes('@') || !password) {
      return NextResponse.json({
        message: 'Invalid input. Email and password are required.',
      }, { status: 400 });
    }

    // --- Database Connection ---
    const MONGODB_URI = process.env.MONGO_URI;
    if (!MONGODB_URI) {
      console.error("MongoDB URI not found in environment variables.");
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    const usersCollection = db.collection('users');

    // --- Find User ---
    const existingUser = await usersCollection.findOne({ email: email });
    if (!existingUser) {
      // Use a generic message to avoid revealing if an email is registered
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // --- Verify Password ---
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // --- Send Success Response ---
    // In a real-world application, you would generate a JWT or session token here.
    console.log(existingUser.name)
    return NextResponse.json({
        message: 'Login successful!',
        user: {
            id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
            is_admin: existingUser.is_admin
        }
    }, { status: 200 });

  } catch (error) {
    console.error('Error during login:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Something went wrong, could not process login.' }, { status: 500 });
  } finally {
    // --- Close Database Connection ---
    if (client) {
      await client.close();
    }
  }
}
