// Prevent client-side bundling
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

import { MongoClient, Db } from 'mongodb';
import { COLLECTIONS, DATABASE_INDEXES } from './database/schemas';
import { requireServerEnvironment } from './server-utils';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'studioai';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Check if using placeholder values and provide helpful error
if (MONGODB_URI.includes('username:password') && !MONGODB_URI.includes('localhost')) {
  console.warn('⚠️  MongoDB URI contains placeholder values. Please update .env.local with your actual MongoDB connection string.');
  console.warn('📖 Instructions:');
  console.warn('   1. Go to https://cloud.mongodb.com/');
  console.warn('   2. Create a cluster and get your connection string');
  console.warn('   3. Update MONGODB_URI in .env.local');
  console.warn('   4. For now, falling back to local MongoDB...');
}

let client: MongoClient;
let db: Db;
let isConnected = false;

export async function connectToDatabase() {
  // Ensure this only runs on server side
  requireServerEnvironment();
  
  if (isConnected && client && db) {
    return db;
  }

  let currentUri = MONGODB_URI;
  
  try {
    if (!client) {
      // Configuration that avoids client-side encryption features
      const clientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000, // Increased timeout
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        family: 4,
        // Explicitly disable auto-encryption and monitoring
        monitorCommands: false,
        // Don't use client-side field level encryption
        autoEncryption: undefined,
        // Add retry logic
        retryWrites: true,
        retryReads: true,
      };

      // If using placeholder URI, try localhost instead
      if (currentUri.includes('username:password') && currentUri.includes('cluster.mongodb.net')) {
        console.log('🔄 Placeholder MongoDB URI detected, trying localhost...');
        currentUri = 'mongodb://localhost:27017';
      }

      console.log('🔌 Attempting to connect to MongoDB...');
      client = new MongoClient(currentUri, clientOptions);
      await client.connect();
      
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      console.log('✅ Connected to MongoDB successfully');
    }
    
    if (!db) {
      db = client.db(MONGODB_DB);
      
      // Create indexes for optimal performance
      await createIndexes(db);
    }
    
    isConnected = true;
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    
    // If we failed with the original URI and it's not localhost, try localhost as fallback
    if (currentUri !== 'mongodb://localhost:27017' && !currentUri.includes('localhost')) {
      console.log('🔄 Trying localhost as fallback...');
      
      // Reset client
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing MongoDB client:', closeError);
        }
        client = null as any;
        db = null as any;
      }
      
      try {
        const localClientOptions = {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 5000,
          family: 4,
          monitorCommands: false,
          autoEncryption: undefined,
        };
        
        client = new MongoClient('mongodb://localhost:27017', localClientOptions);
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        
        db = client.db(MONGODB_DB);
        await createIndexes(db);
        
        isConnected = true;
        console.log('✅ Connected to local MongoDB successfully');
        return db;
      } catch (localError) {
        console.error('❌ Local MongoDB connection also failed:', localError);
      }
    }
    
    // Reset client on connection failure
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MongoDB client:', closeError);
      }
      client = null as any;
      db = null as any;
    }
    
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    for (const [collectionName, indexes] of Object.entries(DATABASE_INDEXES)) {
      const collection = database.collection(collectionName);
      
      for (const index of indexes) {
        try {
          await collection.createIndex(index);
        } catch (error) {
          // Index might already exist, which is fine
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
