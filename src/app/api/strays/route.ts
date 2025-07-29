import { NextResponse } from 'next/server';
import getClient from '@/lib/mongodb';
import { Pet } from '@/lib/placeholder-data';

export async function GET() {
  try {
    const client = await getClient;
    const db = client.db();

    // Find all pets marked with the 'Stray' listingType, sort by newest first
    const pets = await db.collection<Pet>('pets')
      .find({ listingType: 'Stray' })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ pets });

  } catch (error) {
    console.error('Failed to fetch stray pets:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
