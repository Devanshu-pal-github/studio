'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Import different onboarding stages
import WelcomeStage from './stages/WelcomeStage';
import ExperienceStage from './stages/ExperienceStage';
import InterestsStage from './stages/InterestsStage';
import GoalsStage from './stages/GoalsStage';
import LearningStyleStage from './stages/LearningStyleStage';
import AvailabilityStage from './stages/AvailabilityStage';
import TechStackStage from './stages/TechStackStage';
import ProjectTypeStage from './stages/ProjectTypeStage';
import MotivationStage from './stages/MotivationStage';
import CompletionStage from './stages/CompletionStage';

export interface UserProfile {
  // Personal Information
  name: string;
  currentRole: string;
  experience: string;
  
  // Technical Information
  techStack: string[];
  programmingExperience: string;
  familiarTechnologies: string[];
  
  // Learning Preferences
  learningStyle: string[];
  preferredResources: string[];
  timeAvailability: string;
  
  // Goals and Motivation
  shortTermGoals: string[];
  longTermGoals: string[];
  motivation: string;
  careerDirection: string;
  
  // Project Preferences
  projectTypes: string[];
  difficultyPreference: string;
  interestAreas: string[];
  
  // Progress Tracking
  completedOnboarding: boolean;
  onboardingCompletedAt: Date;
  profileVersion: number;
}

const onboardingStages = [
  'welcome',
  'experience',
  'interests', 
  'goals',
  'learningStyle',
  'availability',
  'techStack',
  'projectType',
  'motivation',
  'completion'
];

export default function TunnelVisionOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/user/onboarding', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.completedOnboarding) {
          // User already completed onboarding, redirect to dashboard
          router.push('/');
          return;
        }
        // Continue with existing profile data
        if (data.profile) {
          setUserProfile(data.profile);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (stageData: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...stageData }));
  };

  const nextStage = () => {
    if (currentStage < onboardingStages.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setIsAnalyzing(false);
        return;
      }

      const finalProfile: UserProfile = {
        ...userProfile as UserProfile,
        completedOnboarding: true,
        onboardingCompletedAt: new Date(),
        profileVersion: 1
      };

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile: finalProfile,
          completedOnboarding: true,
        }),
      });

      if (response.ok) {
        // Simulate AI analysis time
        setTimeout(() => {
          setIsAnalyzing(false);
          router.push('/');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to complete onboarding:', errorData.error);
        setIsAnalyzing(false);
      }
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto p-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto flex items-center justify-center"
          >
            <span className="text-white text-xl">🧠</span>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Analyzing Your Profile...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI is creating your personalized learning experience based on your responses.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderCurrentStage = () => {
    const stage = onboardingStages[currentStage];
    const progress = ((currentStage + 1) / onboardingStages.length) * 100;

    const stageProps = {
      userProfile,
      updateProfile,
      nextStage,
      prevStage,
      progress,
      isFirst: currentStage === 0,
      isLast: currentStage === onboardingStages.length - 1,
      completeOnboarding
    };

    switch (stage) {
      case 'welcome':
        return <WelcomeStage {...stageProps} />;
      case 'experience':
        return <ExperienceStage {...stageProps} />;
      case 'interests':
        return <InterestsStage {...stageProps} />;
      case 'goals':
        return <GoalsStage {...stageProps} />;
      case 'learningStyle':
        return <LearningStyleStage {...stageProps} />;
      case 'availability':
        return <AvailabilityStage {...stageProps} />;
      case 'techStack':
        return <TechStackStage {...stageProps} />;
      case 'projectType':
        return <ProjectTypeStage {...stageProps} />;
      case 'motivation':
        return <MotivationStage {...stageProps} />;
      case 'completion':
        return <CompletionStage {...stageProps} />;
      default:
        return <WelcomeStage {...stageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderCurrentStage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
