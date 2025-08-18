// Simple demo authentication API endpoints for testing
// These use in-memory storage and basic token encoding for demo purposes

export const DEMO_AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup-simple',
  SIGNIN: '/api/auth/signin-simple', 
  VERIFY: '/api/auth/verify-simple',
};

export const DEMO_CREDENTIALS = {
  email: 'demo@test.com',
  password: 'demo123',
  name: 'Demo User'
};

// Flag to switch between demo mode and full authentication
export const USE_DEMO_AUTH = true;
