// Prevent client-side bundling
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

import { MongoClient, Db } from 'mongodb';
import { DATABASE_INDEXES } from './database/schemas';
import { requireServerEnvironment } from './server-utils';
import { getMongoURI, getMongoDBName } from './config';

const MONGODB_URI = getMongoURI();
const MONGODB_DB = getMongoDBName(MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// No placeholder normalization here; rely on provided env.

let client: MongoClient;
let db: Db;
let isConnected = false;
let connectPromise: Promise<Db> | null = null; // serialize connection attempts

export async function connectToDatabase() {
  // Ensure this only runs on server side
  requireServerEnvironment();
  // Return existing stable connection
  if (isConnected && client && db) return db;

  // If a connection is in-flight, await it
  if (connectPromise) return await connectPromise;

  // Actual connect logic wrapped to ensure only one attempt at a time
  connectPromise = (async (): Promise<Db> => {
  let currentUri = MONGODB_URI;
    try {
      // Connect primary (or localhost if placeholder handled above)
      console.log('🔌 Attempting to connect to MongoDB...');
      const clientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        family: 4,
        monitorCommands: false,
        autoEncryption: undefined,
        retryWrites: true,
        retryReads: true,
      } as const;

      client = new MongoClient(currentUri, clientOptions);
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      console.log('✅ Connected to MongoDB successfully');

      db = client.db(MONGODB_DB);
      await createIndexes(db);
      isConnected = true;
      return db;
  } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;

      // If we reach here, we could not connect
      if (client) {
        try { await client.close(); } catch {}
      }
      client = null as any;
      db = null as any;
      throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  })();

  try {
    const database = await connectPromise;
    return database;
  } finally {
    // Allow future reconnects if needed
    connectPromise = null;
  }
}

export async function getDatabase() {
  requireServerEnvironment();
  
  if (!db) {
    const database = await connectToDatabase();
    return database;
  }
  return db;
}

async function createIndexes(database: Db) {
  try {
    const entries = Object.entries(DATABASE_INDEXES as unknown as Record<string, ReadonlyArray<unknown>>);
    for (const [collectionName, indexes] of entries) {
      const collection = database.collection(collectionName);
  for (const index of indexes) {
        try {
          if (Array.isArray(index)) {
            const arr = index as unknown[];
            if (arr.length === 2) {
              const spec = arr[0] as Record<string, any>;
              const options = (arr[1] as Record<string, any>) || {};
              await collection.createIndex(spec, options);
            } else {
              const spec = arr[0] as Record<string, any>;
              await collection.createIndex(spec);
            }
          } else {
            const spec: Record<string, any> = index as Record<string, any>;
            await collection.createIndex(spec);
          }
        } catch (error) {
          if (error instanceof Error && !error.message.includes('already exists')) {
            console.warn(`Warning: Could not create index for ${collectionName}:`, error.message);
          }
        }
      }
    }
    console.log('Database indexes created successfully');
  } catch (error) {
    console.warn('Warning: Could not create some database indexes:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
});

export default getDatabase;
