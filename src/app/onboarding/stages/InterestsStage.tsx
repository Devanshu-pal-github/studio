'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Sparkles, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StageProps {
  userProfile: any;
  updateProfile: (data: any) => void;
  nextStage: () => void;
  prevStage: () => void;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
}

const interestCategories = {
  'Web Development': {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '🌐',
    tags: ['React', 'Vue.js', 'Angular', 'HTML/CSS', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Next.js', 'Svelte']
  },
  'Mobile Development': {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '📱',
    tags: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS Development', 'Android Development', 'Xamarin', 'Ionic']
  },
  'Data Science & AI': {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🤖',
    tags: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Jupyter', 'Deep Learning', 'NLP']
  },
  'Backend Development': {
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '⚙️',
    tags: ['Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Django', 'Spring Boot', 'FastAPI', 'Databases', 'APIs']
  },
  'DevOps & Cloud': {
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: '☁️',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Terraform', 'Jenkins', 'Linux', 'Microservices']
  },
  'Game Development': {
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    icon: '🎮',
    tags: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Godot', '2D Games', '3D Games', 'Mobile Games', 'Indie Games']
  },
  'Cybersecurity': {
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '🔒',
    tags: ['Ethical Hacking', 'Network Security', 'Penetration Testing', 'Cryptography', 'Security Auditing', 'Malware Analysis']
  },
  'Design & UI/UX': {
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: '🎨',
    tags: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping', 'User Testing', 'Design Systems', 'Accessibility']
  }
};

export default function InterestsStage({ userProfile, updateProfile, nextStage, prevStage, progress }: StageProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userProfile.interestAreas || []);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(userProfile.familiarTechnologies || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleContinue = () => {
    updateProfile({
      interestAreas: selectedInterests,
      familiarTechnologies: selectedTechnologies
    });
    nextStage();
  };

  const filteredCategories = Object.entries(interestCategories).filter(([category, data]) =>
    category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Discovering Your Interests
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
                <Sparkles className="h-6 w-6 text-purple-500" />
                What excites you in tech?
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Select the areas that spark your curiosity. Don't worry if you're not sure about some - this helps me understand your interests!
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for technologies or areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected Summary */}
              {(selectedInterests.length > 0 || selectedTechnologies.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    ✨ Your Interests ({selectedInterests.length + selectedTechnologies.length} selected)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(interest => (
                      <Badge
                        key={interest}
                        variant="default"
                        className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                    {selectedTechnologies.map(tech => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                        onClick={() => toggleTechnology(tech)}
                      >
                        {tech} ×
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Interest Categories */}
              <div className="space-y-6">
                {filteredCategories.map(([category, data], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{data.icon}</span>
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                        {category}
                      </h3>
                      <Button
                        variant={selectedInterests.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleInterest(category)}
                        className={selectedInterests.includes(category) ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {selectedInterests.includes(category) ? '✓ Interested' : 'Add Interest'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 ml-11">
                      {data.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTechnologies.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedTechnologies.includes(tag) 
                              ? "bg-purple-500 hover:bg-purple-600 text-white" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => toggleTechnology(tag)}
                        >
                          {tag}
                          {selectedTechnologies.includes(tag) && ' ✓'}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Custom Interest */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Don't see what you're looking for?
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add your own interest..."
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                    className="flex-1"
                  />
                  <Button onClick={addCustomInterest} disabled={!customInterest.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  💡 Pro Tips:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Select 3-5 main areas you're most excited about</li>
                  <li>• It's okay to be curious about areas you haven't tried yet</li>
                  <li>• You can always explore new interests later on the platform</li>
                </ul>
              </div>

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
                  disabled={selectedInterests.length === 0 && selectedTechnologies.length === 0}
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
