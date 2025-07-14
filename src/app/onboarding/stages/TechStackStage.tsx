// Simple placeholder stages for the remaining components

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

export default function TechStackStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedTech, setSelectedTech] = useState<string[]>(userProfile.techStack || []);

  const techOptions = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C#', 'Go', 'Rust'];

  const toggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleContinue = () => {
    updateProfile({ techStack: selectedTech });
    nextStage();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Tech Stack Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {techOptions.map(tech => (
                <Button
                  key={tech}
                  variant={selectedTech.includes(tech) ? "default" : "outline"}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </Button>
              ))}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={prevStage}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinue}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
