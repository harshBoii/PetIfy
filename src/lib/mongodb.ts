// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!MONGO_URI) {
  throw new Error('Define MONGO_URI in .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // use a global to preserve across HMR
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(MONGO_URI, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(MONGO_URI, options);
  clientPromise = client.connect();
}

export default clientPromise;
