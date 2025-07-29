import { NextResponse } from 'next/server';
import { GridFSBucket } from 'mongodb';
import getClient from '@/lib/mongodb';
import { Readable } from 'stream';
import type { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Decode the filename from the URL, which handles spaces (%20) etc.
    const decodedFilename = decodeURIComponent(params.filename);

    if (!decodedFilename) {
      return NextResponse.json({ message: 'Filename is required.' }, { status: 400 });
    }
    
    const client = await getClient;
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Use the decoded filename to find the file in GridFS
    const file = await bucket.find({ filename: decodedFilename }).limit(1).next();

    if (!file) {
      return NextResponse.json({ message: 'File not found.' }, { status: 404 });
    }

    const downloadStream = bucket.openDownloadStream(file._id);
    const webReadableStream = Readable.toWeb(downloadStream) as ReadableStream;

    const headers = new Headers();
    headers.set('Content-Type', file.contentType || 'application/octet-stream');

    // **FIX:** Sanitize the filename to remove any non-ASCII characters
    // before setting it in the Content-Disposition header. This prevents the TypeError.
    const sanitizedFilename = file.filename.replace(/[^\x00-\x7F]/g, "");
    headers.set('Content-Disposition', `inline; filename="${sanitizedFilename}"`);

    return new Response(webReadableStream, {
      headers,
    });

  } catch (error) {
    console.error('Failed to retrieve file from GridFS:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'An internal server error occurred.', details: errorMessage },
      { status: 500 }
    );
  }
}
