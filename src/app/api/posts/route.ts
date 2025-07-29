import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import getClient from '@/lib/mongodb';
import { Readable } from 'stream';
import { Post } from '@/lib/placeholder-data';

// GET all posts
export async function GET() {
  try {
    const client = await getClient;
    const db = client.db();
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    // Map the posts to include the id field
    const formattedPosts = posts.map(post => ({
      ...post,
      id: post._id.toString()
    }));
    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ message: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST a new post
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const client = await getClient;
    const db = client.db();

    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const authorId = formData.get('authorId') as string;
    const authorAvatar = formData.get('authorAvatar') as string;
    const imageFile = formData.get('image') as File | null;

    if (!content || !author || !authorId) {
      return NextResponse.json({ error: 'Missing required post data.' }, { status: 400 });
    }

    let imageUrl: string | undefined = undefined;

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

    // The fix is to remove the explicit Omit<Post, 'id'> type annotation.
    // This allows TypeScript to infer the correct type for the new object,
    // which includes a standard JavaScript `Date` object that MongoDB expects.
    const newPost = {
      content,
      author,
      authorId,
      authorAvatar,
      imageUrl,
      likes: [] as any[],
      comments: [] as any[],
      createdAt: new Date(),
    };

    await db.collection('posts').insertOne(newPost);

    return NextResponse.json({ message: 'Post created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
}
