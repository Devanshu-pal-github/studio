import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_change_this_in_production_12345';

export interface User {
  _id?: string;
  email: string;
  name: string;
  photoURL?: string;
  createdAt: Date;
  completedOnboarding: boolean;
  experienceLevel?: string;
  interests?: string[];
  goals?: string[];
  learningStyle?: string;
  techStack?: string[];
}

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export class AuthService {
  private async getUsersCollection() {
    const db = await getDatabase();
    return db.collection('users');
  }

  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const users = await this.getUsersCollection();
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userDoc = {
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
      completedOnboarding: false,
    };

    const result = await users.insertOne(userDoc);
    
    const user: User = {
      _id: result.insertedId.toString(),
      email,
      name,
      createdAt: new Date(),
      completedOnboarding: false,
    };

    // Generate token
    const token = this.generateToken({
      userId: user._id!,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getUsersCollection();
    
    const userDoc = await users.findOne({ email });
    if (!userDoc) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      photoURL: userDoc.photoURL,
      createdAt: userDoc.createdAt,
      completedOnboarding: userDoc.completedOnboarding || false,
      experienceLevel: userDoc.experienceLevel,
      interests: userDoc.interests,
      goals: userDoc.goals,
      learningStyle: userDoc.learningStyle,
      techStack: userDoc.techStack,
    };

    // Generate token
    const token = this.generateToken({
      userId: user._id!,
      email: user.email,
      name: user.name,
    });
    
    return { user, token };
  }

  generateToken(payload: AuthToken): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string): AuthToken {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = await this.getUsersCollection();
    const userDoc = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!userDoc) return null;
    
    return {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      photoURL: userDoc.photoURL,
      createdAt: userDoc.createdAt,
      completedOnboarding: userDoc.completedOnboarding || false,
      experienceLevel: userDoc.experienceLevel,
      interests: userDoc.interests,
      goals: userDoc.goals,
      learningStyle: userDoc.learningStyle,
      techStack: userDoc.techStack,
    };
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsersCollection();
    
    // Remove _id from updates to prevent modification
    const { _id, ...safeUpdates } = updates;
    
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { ...safeUpdates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) return null;

    return {
      _id: result.value._id.toString(),
      email: result.value.email,
      name: result.value.name,
      photoURL: result.value.photoURL,
      createdAt: result.value.createdAt,
      completedOnboarding: result.value.completedOnboarding || false,
      experienceLevel: result.value.experienceLevel,
      interests: result.value.interests,
      goals: result.value.goals,
      learningStyle: result.value.learningStyle,
      techStack: result.value.techStack,
    };
  }
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export const authService = new AuthService();
