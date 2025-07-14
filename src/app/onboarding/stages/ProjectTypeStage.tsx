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

export default function ProjectTypeStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(userProfile.projectTypes || []);

  const projectTypes = [
    'Web Applications', 'Mobile Apps', 'APIs', 'Desktop Apps', 
    'Games', 'Data Projects', 'AI/ML Projects', 'DevOps Tools'
  ];

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleContinue = () => {
    updateProfile({ projectTypes: selectedTypes });
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
              What types of projects interest you?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {projectTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  onClick={() => toggleType(type)}
                  className="h-auto py-4"
                >
                  {type}
                </Button>
              ))}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={prevStage}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinue} disabled={selectedTypes.length === 0}>
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
