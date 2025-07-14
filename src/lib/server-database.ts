/**
 * Server-only MongoDB operations
 * This file should never be imported by client-side code
 */

import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { COLLECTIONS } from './database/schemas';
import { requireServerEnvironment } from './server-utils';

export async function getUserById(userId: string) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(userId) });
}

export async function getUserByEmail(email: string) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USERS).findOne({ email });
}

export async function createUser(userData: any) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USERS).insertOne(userData);
}

export async function updateUser(userId: string, updates: any) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USERS).updateOne(
    { _id: new ObjectId(userId) },
    { $set: updates }
  );
}

export async function getUserActivities(userId: string, limit = 50) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USER_ACTIVITIES)
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

export async function addUserActivity(activityData: any) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USER_ACTIVITIES).insertOne(activityData);
}

export async function getUserProgress(userId: string) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USER_PROGRESS).findOne({ userId });
}

export async function updateUserProgress(userId: string, progressData: any) {
  requireServerEnvironment();
  const db = await connectToDatabase();
  return await db.collection(COLLECTIONS.USER_PROGRESS).updateOne(
    { userId },
    { $set: progressData },
    { upsert: true }
  );
}
