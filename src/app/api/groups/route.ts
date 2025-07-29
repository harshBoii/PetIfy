import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import getClient from '@/lib/mongodb';
import { Readable } from 'stream';
import { CommunityGroup } from '@/lib/placeholder-data';

// GET all groups
export async function GET() {
  try {
    const client = await getClient;
    const db = client.db();
    const groups = await db.collection('groups')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return NextResponse.json({ message: 'Failed to fetch groups' }, { status: 500 });
  }
}

// POST a new group
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const client = await getClient;
    const db = client.db();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const ownerId = formData.get('ownerId') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name || !description || !ownerId) {
      return NextResponse.json({ error: 'Missing required group data.' }, { status: 400 });
    }

    let imageUrl = "https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image";

    if (imageFile) {
      const bucket = new GridFSBucket(db, { bucketName: 'images' });
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      const readableStream = Readable.from(fileBuffer);
      const filename = `${Date.now()}-${imageFile.name}`;
      
      const uploadStream = bucket.openUploadStream(filename, { contentType: imageFile.type });
      readableStream.pipe(uploadStream);
      
      await new Promise<void>((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      imageUrl = `/api/image/${filename}`;
    }

    const newGroup = {
      name,
      description,
      ownerId,
      imageUrl,
      members: 1,
      memberIds: [ownerId],
      createdAt: new Date(),
    };

    await db.collection('groups').insertOne(newGroup);

    return NextResponse.json({ message: 'Group created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to create group:', error);
    return NextResponse.json({ message: 'Failed to create group' }, { status: 500 });
  }
}
