import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import getClient from '@/lib/mongodb';

interface Params { id: string }

// GET a single post by ID
export async function GET(
  _req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const client = await getClient;
    const db = client.db();
    const post = await db.collection('posts').findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: post._id.toString(),
      author: post.author,
      authorId: post.authorId,
      authorAvatar: post.authorAvatar,
      content: post.content,
      imageUrl: post.imageUrl,
      likes: post.likes || [],
      comments: post.comments || [],
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update post (likes and comments)
export async function PUT(
  req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { action, userId, comment } = await req.json();
    
    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await getClient;
    const db = client.db();
    
    // Handle different update actions
    if (action === 'like') {
      const post = await db.collection('posts').findOne({ _id: new ObjectId(id) });
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      const likes = post.likes || [];
      const userLiked = likes.includes(userId);
      
      let updateOperation;
      if (userLiked) {
        // Remove like
        updateOperation = {
          $pull: { likes: userId }
        };
      } else {
        // Add like
        updateOperation = {
          $addToSet: { likes: userId }
        };
      }
      
      await db.collection('posts').updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );
      
      return NextResponse.json({ 
        message: userLiked ? 'Like removed' : 'Post liked',
        liked: !userLiked
      });
    } 
    else if (action === 'comment') {
      if (!comment) {
        return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
      }
      
      // Create a new comment object that matches the Comment interface
      const newComment = {
        id: `c${Date.now()}`,
        author: comment.author,
        authorId: userId,
        avatar: comment.avatar,
        comment: comment.text,
        createdAt: new Date()
      };
      
      // Use $push operator to add the comment to the comments array
      const result = await db.collection('posts').updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      return NextResponse.json({ 
        message: 'Comment added',
        comment: newComment
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}