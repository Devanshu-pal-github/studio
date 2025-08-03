
'use client';

import LandingClient from './landing/LandingClient';

export default function HomePage() {
  // Always show landing page in guest mode
  // Authentication and routing logic is handled by AuthContext
  return <LandingClient />;
}
