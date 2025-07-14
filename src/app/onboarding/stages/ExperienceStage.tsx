'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Code, Briefcase, GraduationCap, Lightbulb, Rocket } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

const experienceOptions = [
  {
    id: 'complete-beginner',
    title: 'Complete Beginner',
    description: 'New to programming and technology',
    icon: '🌱',
    details: 'Perfect! Everyone starts somewhere. We\'ll build your foundation step by step.',
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 'some-experience',
    title: 'Some Experience',
    description: 'Dabbled with coding or tech courses',
    icon: '🌿',
    details: 'Great start! We\'ll help you build on what you already know.',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Built projects, familiar with concepts',
    icon: '🌳',
    details: 'Excellent foundation! Ready to tackle more challenging projects.',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'experienced',
    title: 'Experienced',
    description: 'Professional developer or advanced learner',
    icon: '🚀',
    details: 'Impressive! We\'ll help you master advanced concepts and new technologies.',
    gradient: 'from-orange-400 to-red-500'
  }
];

const followUpQuestions = {
  'complete-beginner': [
    'What sparked your interest in technology?',
    'Have you tried any online tutorials before?',
    'Are you looking to change careers or explore a hobby?'
  ],
  'some-experience': [
    'What programming languages have you tried?',
    'What\'s the most complex project you\'ve worked on?',
    'What areas do you want to improve in?'
  ],
  'intermediate': [
    'What technologies are you most comfortable with?',
    'What type of projects do you enjoy building?',
    'What\'s your biggest challenge right now?'
  ],
  'experienced': [
    'What\'s your area of expertise?',
    'What new technologies are you interested in learning?',
    'Are you looking to mentor others or dive deeper into specializations?'
  ]
};

export default function ExperienceStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedExperience, setSelectedExperience] = useState(userProfile.programmingExperience || '');
  const [currentRole, setCurrentRole] = useState(userProfile.currentRole || '');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);

  const handleExperienceSelect = (experienceId: string) => {
    setSelectedExperience(experienceId);
    setShowFollowUp(true);
  };

  const handleFollowUpAnswer = (answer: string) => {
    if (!followUpAnswers.includes(answer)) {
      setFollowUpAnswers([...followUpAnswers, answer]);
    }
  };

  const handleContinue = () => {
    updateProfile({
      programmingExperience: selectedExperience,
      currentRole,
      experienceDetails: followUpAnswers
    });
    nextStage();
  };

  const selectedOption = experienceOptions.find(opt => opt.id === selectedExperience);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Understanding Your Background
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
                What's your programming experience?
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                This helps me understand where you're starting from so I can tailor everything perfectly for you.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!showFollowUp ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {experienceOptions.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                          selectedExperience === option.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => handleExperienceSelect(option.id)}
                      >
                        <CardContent className="p-6">
                          <div className="text-center space-y-4">
                            <div className="text-4xl">{option.icon}</div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                {option.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Selected Experience Confirmation */}
                    <div className={`bg-gradient-to-r ${selectedOption?.gradient} rounded-2xl p-6 text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{selectedOption?.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedOption?.title}</h3>
                          <p className="opacity-90">{selectedOption?.details}</p>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Questions */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Tell me a bit more about yourself:
                      </h4>
                      
                      <div className="space-y-3">
                        {selectedExperience && followUpQuestions[selectedExperience as keyof typeof followUpQuestions]?.map((question, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                          >
                            <Button
                              variant={followUpAnswers.includes(question) ? "default" : "outline"}
                              className="w-full text-left justify-start h-auto p-4 text-wrap"
                              onClick={() => handleFollowUpAnswer(question)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {followUpAnswers.includes(question) ? '✅' : '💭'}
                                </div>
                                <span>{question}</span>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          💡 You can select multiple options that resonate with you
                        </p>
                      </div>
                    </div>

                    {/* Current Role Quick Tags */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        What best describes your current situation?
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Student', 'Career Switcher', 'Professional Developer', 
                          'Freelancer', 'Entrepreneur', 'Hobbyist', 'Job Seeker'
                        ].map(role => (
                          <Badge
                            key={role}
                            variant={currentRole === role ? "default" : "outline"}
                            className="cursor-pointer px-3 py-2 text-sm"
                            onClick={() => setCurrentRole(role)}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
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
                  disabled={!selectedExperience || (showFollowUp && followUpAnswers.length === 0)}
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

export default ExperienceStage;
