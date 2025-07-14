'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

const timeOptions = [
  { id: '1-2', label: '1-2 hours/week', description: 'Perfect for busy schedules', icon: '⏰' },
  { id: '3-5', label: '3-5 hours/week', description: 'Steady progress', icon: '📅' },
  { id: '6-10', label: '6-10 hours/week', description: 'Accelerated learning', icon: '🚀' },
  { id: '10+', label: '10+ hours/week', description: 'Intensive learning', icon: '💪' },
  { id: 'flexible', label: 'Flexible schedule', description: 'Varies week to week', icon: '🌊' }
];

export default function AvailabilityStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [timeAvailability, setTimeAvailability] = useState(userProfile.timeAvailability || '');

  const handleContinue = () => {
    updateProfile({ timeAvailability });
    nextStage();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Time Planning
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
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-blue-500" />
                How much time can you dedicate?
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Be realistic! Even 1 hour per week can lead to amazing progress with consistent effort.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {timeOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        timeAvailability === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setTimeAvailability(option.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{option.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                              {option.label}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              {option.description}
                            </p>
                          </div>
                          {timeAvailability === option.id && (
                            <div className="text-blue-500 text-xl">✓</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStage}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={!timeAvailability}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
