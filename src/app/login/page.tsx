
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Chrome, Github } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
    }
    setError(null);
    return true;
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
        if (error.code === 'auth/popup-blocked') {
            setError('Pop-up was blocked by the browser. Please allow pop-ups for this site and try again.');
        } else {
            setError(error.message);
        }
    }
  };

  const handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
        if (error.code === 'auth/popup-blocked') {
            setError('Pop-up was blocked by the browser. Please allow pop-ups for this site and try again.');
        } else {
            setError(error.message);
        }
    }
  };
  
  const handleEmailSignUp = async () => {
    if (!validateForm()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEmailSignIn = async () => {
    if (!validateForm()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-gray-500 dark:text-gray-400">Create an account or sign in.</p>
        </div>

        {error && <p className="text-red-500 text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</p>}

        <div className="space-y-4">
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
        </div>

        <div className="flex flex-col space-y-2">
            <Button onClick={handleEmailSignIn}>Sign In</Button>
            <Button onClick={handleEmailSignUp} variant="outline">Sign Up</Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Or continue with
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleGoogleSignIn}>
            <Chrome className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button variant="outline" onClick={handleGithubSignIn}>
            <Github className="mr-2 h-5 w-5" />
            GitHub
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
