'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/lib/database';
import { aiService } from '@/lib/aiService';
import ProjectDetailClient from './ProjectDetailClient';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  estimatedTime: string;
  roadmap: any[];
  resources: any[];
  status: string;
}

export default function ProjectPage() {
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      loadProjectData();
    }
  }, [user, params.id]);

  const loadProjectData = async () => {
    try {
      // Get project from database
      const projectData = await DatabaseService.getProject(params.id as string);
      
      if (!projectData) {
        setIsLoading(false);
        return;
      }

      setProject(projectData);

      // Generate AI-powered roadmap if not exists
      if (!projectData.roadmap || projectData.roadmap.length === 0) {
        const userProfile = await DatabaseService.getUserProfile(user!.uid);
        const onboardingData = await DatabaseService.getOnboardingData(user!.uid);
        
        const generatedRoadmap = await aiService.generateProjectRoadmap(
          projectData.title,
          onboardingData?.experience || 'beginner',
          projectData.technologies,
          projectData.estimatedTime
        );
        
        setRoadmap(generatedRoadmap);
        
        // Update project with generated roadmap
        const roadmapPhases = generatedRoadmap.phases.map((phase, index) => ({
          phase: index + 1,
          title: phase.title,
          tasks: phase.tasks.map((task, taskIndex) => ({
            id: `task-${index}-${taskIndex}`,
            title: task.title,
            description: task.description,
            completed: false
          }))
        }));

        await DatabaseService.updateProject(params.id as string, {
          roadmap: roadmapPhases
        });
      } else {
        // Use existing roadmap
        setRoadmap({
          overview: projectData.description,
          phases: projectData.roadmap.map(phase => ({
            title: phase.title,
            description: `Phase ${phase.phase}: ${phase.title}`,
            estimatedTime: 'TBD',
            tasks: phase.tasks
          })),
          finalOutcome: `Complete ${projectData.title} project`
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Project</h3>
            <p className="text-gray-600">Generating personalized roadmap...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-gray-600">The project you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-8">
        <Badge 
          variant={
            project.difficulty === 'beginner' ? 'secondary' : 
            project.difficulty === 'intermediate' ? 'default' : 
            'destructive'
          } 
          className="mb-2"
        >
          {project.difficulty}
        </Badge>
        <h1 className="font-headline text-4xl font-bold">{project.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline">{tech}</Badge>
          ))}
        </div>
      </div>

      <ProjectDetailClient />
    </div>
  );
}
