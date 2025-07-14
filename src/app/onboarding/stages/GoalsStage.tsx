'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Target, Lightbulb, Trophy } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

const goalCategories = [
  {
    id: 'career-change',
    title: 'Career Change',
    description: 'Transition into tech from another field',
    icon: '🔄',
    timeframe: '6-12 months',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'skill-upgrade',
    title: 'Skill Upgrade',
    description: 'Learn new technologies in my current role',
    icon: '📈',
    timeframe: '3-6 months',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    id: 'first-job',
    title: 'First Tech Job',
    description: 'Land my first position in technology',
    icon: '🚀',
    timeframe: '6-18 months',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'freelance',
    title: 'Freelancing',
    description: 'Build skills for independent projects',
    icon: '💼',
    timeframe: '3-9 months',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'startup',
    title: 'Start a Business',
    description: 'Learn to build my own tech product',
    icon: '🏗️',
    timeframe: '6-24 months',
    color: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  {
    id: 'personal-growth',
    title: 'Personal Interest',
    description: 'Learn for the joy of understanding',
    icon: '🌱',
    timeframe: 'No rush',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
];

export default function GoalsStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userProfile.shortTermGoals || []);
  const [timeframe, setTimeframe] = useState(userProfile.timeframe || '');
  const [customGoal, setCustomGoal] = useState(userProfile.customGoal || '');

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    updateProfile({
      shortTermGoals: selectedGoals,
      timeframe,
      customGoal
    });
    nextStage();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Setting Your Goals
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
                <Target className="h-6 w-6 text-blue-500" />
                What are you hoping to achieve?
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Understanding your goals helps me create the perfect learning path for you.
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Goal Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                {goalCategories.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        selectedGoals.includes(goal.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="text-2xl">{goal.icon}</div>
                            {selectedGoals.includes(goal.id) && (
                              <div className="text-blue-500">✓</div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {goal.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {goal.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-1 rounded-full ${goal.color}`}>
                              {goal.timeframe}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Custom Goal */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    Have a specific goal in mind?
                  </h4>
                </div>
                <Textarea
                  placeholder="Tell me about your specific aspirations or what success looks like to you..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Timeframe Selection */}
              {selectedGoals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      When would you like to achieve your main goal?
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['3 months', '6 months', '1 year', '2+ years'].map(time => (
                      <Button
                        key={time}
                        variant={timeframe === time ? "default" : "outline"}
                        onClick={() => setTimeframe(time)}
                        className="h-auto py-3"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Motivational Message */}
              {selectedGoals.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <p className="text-center text-green-800 dark:text-green-200 font-medium">
                    🎉 Excellent goals! I'm already planning projects that will help you achieve them step by step.
                  </p>
                </div>
              )}

              {/* Navigation */}
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
                  disabled={selectedGoals.length === 0}
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
