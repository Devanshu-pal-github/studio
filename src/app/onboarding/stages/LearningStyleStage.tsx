'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, BookOpen, Video, Code, Users, MessageCircle } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

const learningStyles = [
  {
    id: 'visual',
    title: 'Visual Learner',
    description: 'I learn best with videos, diagrams, and visual content',
    icon: <Video className="h-8 w-8" />,
    color: 'bg-red-100 text-red-800 border-red-300',
    resources: ['YouTube tutorials', 'Interactive demos', 'Visual documentation']
  },
  {
    id: 'reading',
    title: 'Reading Learner',
    description: 'I prefer documentation, articles, and written guides',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    resources: ['Technical documentation', 'Blog posts', 'Written tutorials']
  },
  {
    id: 'hands-on',
    title: 'Hands-on Learner',
    description: 'I learn by doing and experimenting with code',
    icon: <Code className="h-8 w-8" />,
    color: 'bg-green-100 text-green-800 border-green-300',
    resources: ['Coding challenges', 'Interactive exercises', 'Project building']
  },
  {
    id: 'social',
    title: 'Social Learner',
    description: 'I learn through discussions and community interaction',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    resources: ['Forums', 'Study groups', 'Mentorship']
  },
  {
    id: 'conversational',
    title: 'Conversational Learner',
    description: 'I learn through Q&A and interactive conversations',
    icon: <MessageCircle className="h-8 w-8" />,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    resources: ['AI tutoring', 'Q&A sessions', 'Interactive chat']
  }
];

export default function LearningStyleStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(userProfile.learningStyle || []);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  const handleContinue = () => {
    updateProfile({
      learningStyle: selectedStyles
    });
    nextStage();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Understanding How You Learn
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
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                How do you learn best?
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Everyone learns differently. Help me understand your preferred learning style so I can recommend the best resources.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {learningStyles.map((style, index) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        selectedStyles.includes(style.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => toggleStyle(style.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                {style.title}
                              </h3>
                              {selectedStyles.includes(style.id) && (
                                <div className="text-blue-500 text-xl">✓</div>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {style.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {style.resources.map(resource => (
                                <span
                                  key={resource}
                                  className={`text-xs px-2 py-1 rounded-full ${style.color}`}
                                >
                                  {resource}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {selectedStyles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700"
                >
                  <p className="text-center text-green-800 dark:text-green-200 font-medium">
                    🎯 Perfect! I'll prioritize {selectedStyles.length > 1 ? 'these learning methods' : 'this learning method'} when recommending resources.
                  </p>
                </motion.div>
              )}

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
                  disabled={selectedStyles.length === 0}
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
