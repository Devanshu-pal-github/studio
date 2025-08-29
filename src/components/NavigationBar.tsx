'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  User, 
  LogOut, 
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">StudoAI</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => router.push(user?.completedOnboarding ? '/dashboard' : '/onboarding')} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">StudoAI</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(user?.completedOnboarding ? '/dashboard' : '/onboarding')}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <button type="button" onClick={() => router.push('/profile')} className="flex items-center space-x-2 hover:opacity-90">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.name || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Level 1
                  </Badge>
                </div>
              </button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
