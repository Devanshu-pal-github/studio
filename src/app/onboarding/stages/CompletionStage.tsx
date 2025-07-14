'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight, Sparkles, Trophy } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

export default function CompletionStage({ userProfile, prevStage, progress }: StageProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Here you would typically save the user profile to your backend
    // For now, we'll simulate the process and redirect to dashboard
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <Progress value={100} className="h-2" />
        </div>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Welcome aboard, {userProfile.name}!
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Your personalized learning journey is ready to begin
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Your Profile Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Experience Level:</strong> {userProfile.experienceLevel}
                </div>
                <div>
                  <strong>Learning Style:</strong> {userProfile.learningStyle}
                </div>
                <div>
                  <strong>Weekly Commitment:</strong> {userProfile.availability}
                </div>
                <div>
                  <strong>Primary Goals:</strong> {userProfile.goals?.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Based on your responses, I've crafted a personalized learning experience just for you. 
                Your AI mentor is ready to guide you through projects, resources, and challenges 
                tailored to your goals and learning style.
              </p>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={prevStage} disabled={isCompleting}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={isCompleting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isCompleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                    />
                    Setting up your dashboard...
                  </>
                ) : (
                  <>
                    Enter Your Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
