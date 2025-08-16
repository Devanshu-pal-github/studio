'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPage() {
  const { user, loading, logout } = useAuth();

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const checkStorage = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log('Local Storage:', { token: token ? 'exists' : 'none', userData });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
            {user && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Onboarding:</strong> {user.completedOnboarding ? 'Completed' : 'Not completed'}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Button onClick={checkStorage} className="w-full">
              Check Local Storage
            </Button>
            <Button onClick={clearAuth} variant="destructive" className="w-full">
              Clear Authentication
            </Button>
            {user && (
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
