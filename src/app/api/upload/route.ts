import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import getClient from '@/lib/mongodb';
import { Readable } from 'stream';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract text fields from the form data
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const reporterContact = formData.get('reporterContact') as string;
    const file = formData.get('file') as File | null;

    // Basic validation for required text fields
    if (!location || !description) {
        return NextResponse.json({ error: 'Location and description are required fields.' }, { status: 400 });
    }

    const client = await getClient;
    const db = client.db();
    
    let imageUrl = "https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image";

    // Check if a file was uploaded and process it
    if (file) {
        const bucket = new GridFSBucket(db, { bucketName: 'images' });
        
        // Convert file to a buffer and then a readable stream
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const readableStream = Readable.from(fileBuffer);
        const filename = `${Date.now()}-${file.name}`;

        // Open an upload stream to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.type,
        });

        // Pipe the file data into the GridFS stream
        readableStream.pipe(uploadStream);

        // Wait for the stream to finish uploading
        await new Promise<void>((resolve, reject) => {
            uploadStream.on('finish', () => resolve());
            uploadStream.on('error', (err) => reject(new Error(`GridFS upload failed: ${err.message}`)));
        });
        
        // Set the image URL to the API endpoint that serves the image
        imageUrl = `/api/image/${filename}`;
    }
    
    // Save the complete report to the 'pets' collection
    const petsCollection = db.collection('pets');
    await petsCollection.insertOne({
        name: "Found Stray",
        type: "Other", // Default values for a stray report
        breed: "Unknown",
        age: "Unknown",
        gender: "Unknown",
        listingType: "Stray",
        location,
        description,
        reporterContact,
        imageUrl, // This will be the API route to the image or a placeholder
        createdAt: new Date(), // Use a proper timestamp for sorting
    });

    return NextResponse.json({ 
      message: "Report submitted successfully",
    });

  } catch (error) {
    console.error('Upload and report submission failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Submission failed.', details: errorMessage },
      { status: 500 }
    );
  }
}
