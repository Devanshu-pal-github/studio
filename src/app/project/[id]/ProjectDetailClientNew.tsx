"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Youtube, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2 as CheckCircle2Icon,
  Code,
  ExternalLink,
  Play,
  Timer,
  Trophy
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import AIChatbot from '@/components/AIChatbot';

interface ProjectDetailProps {
  project: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    technologies: string[];
    estimatedTime: string;
    roadmap: any[];
    resources: any[];
    status: string;
  };
  roadmap?: {
    overview: string;
    phases: {
      title: string;
      description: string;
      estimatedTime: string;
      tasks: {
        title: string;
        description: string;
        resources?: string[];
        difficulty?: string;
      }[];
    }[];
    finalOutcome: string;
  };
}

export default function ProjectDetailClient({ project, roadmap }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState(0);
  const [codeEnvironment, setCodeEnvironment] = useState<{
    type: 'replit' | 'codesandbox' | 'stackblitz';
    url: string;
  } | null>(null);

  useEffect(() => {
    if (user && project) {
      loadProgress();
      setupCodeEnvironment();
    }
  }, [user, project]);

  const loadProgress = async () => {
    try {
      // Load user's progress for this project
      const userProjects = await DatabaseService.getUserProjects(user!.uid);
      const currentProject = userProjects.find(p => p.id === project.id);
      
      if (currentProject) {
        const completed = new Set<string>();
        currentProject.roadmap.forEach(phase => {
          phase.tasks.forEach((task: any) => {
            if (task.completed) {
              completed.add(`${phase.phase}-${task.id}`);
            }
          });
        });
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const setupCodeEnvironment = () => {
    // Generate code environment based on technologies
    const { technologies } = project;
    
    if (technologies.includes('React') || technologies.includes('JavaScript') || technologies.includes('TypeScript')) {
      setCodeEnvironment({
        type: 'codesandbox',
        url: `https://codesandbox.io/s/new?template=create-react-app&name=${encodeURIComponent(project.title)}`
      });
    } else if (technologies.includes('Node.js') || technologies.includes('Express')) {
      setCodeEnvironment({
        type: 'replit',
        url: `https://replit.com/new/nodejs?title=${encodeURIComponent(project.title)}`
      });
    } else if (technologies.includes('HTML') || technologies.includes('CSS')) {
      setCodeEnvironment({
        type: 'codesandbox',
        url: `https://codesandbox.io/s/new?template=static&name=${encodeURIComponent(project.title)}`
      });
    } else {
      setCodeEnvironment({
        type: 'stackblitz',
        url: `https://stackblitz.com/fork/github/new?title=${encodeURIComponent(project.title)}`
      });
    }
  };

  const handleTaskComplete = async (phaseIndex: number, taskId: string) => {
    const taskKey = `${phaseIndex}-${taskId}`;
    const newCompleted = new Set(completedTasks);
    
    if (completedTasks.has(taskKey)) {
      newCompleted.delete(taskKey);
    } else {
      newCompleted.add(taskKey);
      
      // Award points for task completion
      await DatabaseService.logActivity(user!.uid, {
        type: 'lesson_complete',
        description: `Completed task in ${project.title}`,
        metadata: {
          projectId: project.id,
          taskId,
          phaseIndex
        },
        points: 3
      });

      toast({
        title: "Task Completed! 🎉",
        description: "You earned 3 points. Keep up the great work!",
      });
    }
    
    setCompletedTasks(newCompleted);
    
    // Update progress in database
    try {
      await DatabaseService.updateProject(project.id, {
        roadmap: project.roadmap.map((phase, pIndex) => ({
          ...phase,
          tasks: phase.tasks.map((task: any) => ({
            ...task,
            completed: pIndex === phaseIndex && task.id === taskId ? 
              !completedTasks.has(taskKey) : task.completed
          }))
        }))
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const calculateProgress = () => {
    if (!roadmap) return 0;
    const totalTasks = roadmap.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    return totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0;
  };

  const openCodeEnvironment = () => {
    if (codeEnvironment) {
      window.open(codeEnvironment.url, '_blank');
      
      // Log activity
      DatabaseService.logActivity(user!.uid, {
        type: 'project_start',
        description: `Opened code environment for ${project.title}`,
        metadata: {
          projectId: project.id,
          environment: codeEnvironment.type
        },
        points: 2
      });
    }
  };

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Project Overview & Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Project Overview</CardTitle>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.round(calculateProgress())}% Complete
            </Badge>
          </div>
          <Progress value={calculateProgress()} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">What You'll Build</h3>
              <p className="text-gray-600 mb-4">{roadmap.overview}</p>
              
              <h3 className="font-semibold mb-2">Technologies</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map(tech => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Final Outcome</h3>
              <p className="text-gray-600 mb-4">{roadmap.finalOutcome}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Time:</span>
                  <span className="font-medium">{project.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Difficulty:</span>
                  <Badge variant={
                    project.difficulty === 'beginner' ? 'secondary' :
                    project.difficulty === 'intermediate' ? 'default' : 'destructive'
                  }>
                    {project.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Environment */}
      {codeEnvironment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Development Environment</span>
            </CardTitle>
            <CardDescription>
              Start coding immediately with a pre-configured environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{codeEnvironment.type}</h4>
                  <p className="text-sm text-gray-600">Ready-to-use development environment</p>
                </div>
              </div>
              <Button onClick={openCodeEnvironment} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Start Coding</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Development Roadmap</CardTitle>
          <CardDescription>
            Follow this step-by-step guide to complete your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={`phase-${currentPhase}`} onValueChange={(value) => setCurrentPhase(parseInt(value.split('-')[1]))}>
            <TabsList className="grid w-full grid-cols-auto" style={{gridTemplateColumns: `repeat(${roadmap.phases.length}, 1fr)`}}>
              {roadmap.phases.map((phase, index) => (
                <TabsTrigger key={index} value={`phase-${index}`} className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{phase.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {roadmap.phases.map((phase, phaseIndex) => (
              <TabsContent key={phaseIndex} value={`phase-${phaseIndex}`} className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{phase.title}</CardTitle>
                      <Badge variant="outline">
                        <Timer className="h-3 w-3 mr-1" />
                        {phase.estimatedTime}
                      </Badge>
                    </div>
                    <CardDescription>{phase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {phase.tasks.map((task, taskIndex) => {
                        const taskId = `task-${phaseIndex}-${taskIndex}`;
                        const isCompleted = completedTasks.has(`${phaseIndex}-${taskId}`);
                        
                        return (
                          <div key={taskIndex} className={`p-4 border rounded-lg transition-all ${
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => handleTaskComplete(phaseIndex, taskId)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className={`font-semibold ${isCompleted ? 'line-through text-green-700' : ''}`}>
                                  {task.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                
                                {task.resources && task.resources.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Resources</h5>
                                    {task.resources.map((resource, rIndex) => (
                                      <a 
                                        key={rIndex}
                                        href={resource}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                      >
                                        📚 {resource}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {isCompleted && (
                                <CheckCircle2Icon className="h-5 w-5 text-green-600 mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Chatbot for project-specific help */}
      <AIChatbot 
        projectId={project.id}
        context={{
          currentProject: project.title,
          learningGoals: project.technologies,
          userLevel: project.difficulty
        }}
      />
    </div>
  );
}
