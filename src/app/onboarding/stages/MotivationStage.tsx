'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

export default function MotivationStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [motivation, setMotivation] = useState(userProfile.motivation || '');

  const handleContinue = () => {
    updateProfile({ motivation });
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
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              What drives you?
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Tell me about your motivation - what keeps you excited about learning?
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Share what motivates you to learn and grow in tech..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={prevStage}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinue} disabled={!motivation.trim()}>
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
