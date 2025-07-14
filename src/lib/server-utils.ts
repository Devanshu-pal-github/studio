// Server-side runtime check utility
export function ensureServerSide(functionName: string) {
  if (typeof window !== 'undefined') {
    throw new Error(`${functionName} can only be called on the server side`);
  }
}

// Type guard for server-side environment
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

// MongoDB connection guard
export function requireServerEnvironment() {
  if (!isServerSide()) {
    throw new Error('This function requires a server-side environment');
  }
}
