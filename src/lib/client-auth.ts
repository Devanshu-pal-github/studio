// Client-safe types and interfaces
// This file does not import any server-only modules

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

export interface UserActivity {
  id: string;
  userId: string;
  type: string;
  description: string;
  metadata?: any;
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  completedChallenges: string[];
  currentStreak: number;
  totalHours: number;
  badgesEarned: string[];
  lastActivity: Date;
}

export interface ProjectProgress {
  projectId: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  startDate?: Date;
  endDate?: Date;
  completionDate?: Date;
  feedback?: string;
  challenges: string[];
  learnings: string[];
  technologies: string[];
}

// Client-side auth service that only uses API calls
export class ClientAuthService {
  async signup(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Signup failed');
    }

    return { user: data.user, token: data.token };
  }

  async signin(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Signin failed');
    }

    return { user: data.user, token: data.token };
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to reset password');
    }
  }
}

export const clientAuthService = new ClientAuthService();
