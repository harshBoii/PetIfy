import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import getClient from '@/lib/mongodb';
import { Readable } from 'stream';
import { Pet } from '@/lib/placeholder-data';

// GET all pets (already exists)
export async function GET() {
  try {
    const client = await getClient;
    const db = client.db();
    const pets = await db.collection<Pet>('pets')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ pets });
  } catch (error) {
    console.error('Failed to fetch pets:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred while fetching pets.' },
      { status: 500 }
    );
  }
}

// POST a new pet listing
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const client = await getClient;
    const db = client.db();

    const imageFile = formData.get('petImage') as File | null;
    let imageUrl = "https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image";

    if (imageFile) {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const readableStream = Readable.from(fileBuffer);
        const filename = `${Date.now()}-${imageFile.name.replace(/[^\x00-\x7F]/g, "")}`;
        
        const uploadStream = bucket.openUploadStream(filename, { contentType: imageFile.type });
        readableStream.pipe(uploadStream);
        
        await new Promise<void>((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
        });

        imageUrl = `/api/image/${filename}`;
    }

    const priceString = formData.get('price') as string | null;
    const priceValue = priceString ? parseFloat(priceString) : undefined;

    const petData = {
      name: formData.get('name'),
      type: formData.get('type'),
      breed: formData.get('breed'),
      age: formData.get('age'),
      gender: formData.get('gender'),
      location: formData.get('location'),
      listingType: formData.get('listingType'),
      description: formData.get('description'),
      ownerId: formData.get('ownerId'),
      imageUrl,
      price: priceValue && !isNaN(priceValue) ? priceValue : undefined,
      createdAt: new Date(),
    };

    // Basic validation
    if (!petData.name || !petData.type || !petData.ownerId) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await db.collection('pets').insertOne(petData);

    return NextResponse.json({ message: 'Listing created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to create listing:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to create listing', details: errorMessage }, { status: 500 });
  }
}
