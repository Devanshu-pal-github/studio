// Singleton in-memory user store for demo endpoints
export interface DemoUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  emailVerified: boolean;
  completedOnboarding: boolean;
  experienceLevel?: string;
  interests?: string[];
  goals?: string[];
  learningStyle?: string;
  techStack?: string[];
  photoURL?: string | null;
}

const store = new Map<string, DemoUser>();

// Seed demo user for quick testing
if (!store.has('demo@test.com')) {
  store.set('demo@test.com', {
    _id: 'demo123',
    name: 'Demo User',
    email: 'demo@test.com',
    password: 'demo123',
    createdAt: new Date(),
    emailVerified: true,
    completedOnboarding: false,
    interests: [],
    goals: [],
    techStack: [],
  });
}

export const demoUsers = store;
