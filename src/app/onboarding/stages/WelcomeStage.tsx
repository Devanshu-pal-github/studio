'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rocket, Target, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

export default function WelcomeStage({ userProfile, updateProfile, nextStage, progress }: StageProps) {
  const { user } = useAuth();
  const [name, setName] = useState(userProfile.name || user?.displayName || '');
  const [isReady, setIsReady] = useState(false);

  const handleContinue = () => {
    updateProfile({ name });
    setIsReady(true);
    setTimeout(() => {
      nextStage();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Getting Started
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-2xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mx-auto mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Welcome to Project Compass! 🚀
              </CardTitle>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                I'm thrilled you're here! This platform is about to become your personal learning companion. 
                In the next few minutes, I'll ask you some questions to understand you better and create 
                an experience that's uniquely yours.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isReady ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        First, what should I call you?
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your preferred name..."
                        className="text-lg p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      What to expect:
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Personal questions about your goals and interests</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Rocket className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Your learning style and preferences</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 mt-1 flex-shrink-0" />
                        <span>Technical background and experience</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Button
                      onClick={handleContinue}
                      disabled={!name.trim()}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Let's Begin My Journey! 
                      <Rocket className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Perfect, {name}!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Let's dive into understanding you better...
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default WelcomeStage;
