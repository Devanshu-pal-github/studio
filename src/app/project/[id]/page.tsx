'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Play, Clock, Star, ArrowLeft } from 'lucide-react';

interface ProjectDetails {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  technologies: string[];
  learningGoals: string[];
  milestones: string[];
  status: string;
  progress: number;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMilestone, setCurrentMilestone] = useState(0);

  useEffect(() => {
    loadProjectDetails();
  }, [params.id]);

  const loadProjectDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Mock project data for now
      const mockProject: ProjectDetails = {
        _id: params.id as string,
        title: "Personal Portfolio Website",
        description: "Build a responsive portfolio website to showcase your skills and projects using modern web technologies.",
        difficulty: "beginner",
        estimatedHours: 15,
        technologies: ["HTML", "CSS", "JavaScript", "Git"],
        learningGoals: ["Responsive Design", "Git/GitHub", "Web Deployment", "CSS Flexbox/Grid"],
        milestones: [
          "Set up project structure and Git repository",
          "Create HTML content and semantic structure", 
          "Style with CSS and make responsive",
          "Add JavaScript interactions and animations",
          "Deploy to web hosting platform"
        ],
        status: "not_started",
        progress: 0
      };

      setProject(mockProject);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProject = async () => {
    if (!project) return;

    try {
      const token = localStorage.getItem('token');
      
      await fetch('/api/user/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'project_start',
          description: `Started project: ${project.title}`,
          metadata: { projectId: project._id, difficulty: project.difficulty }
        }),
      });

      setProject(prev => prev ? { ...prev, status: 'in_progress' } : null);
    } catch (error) {
      console.error('Error starting project:', error);
    }
  };

  const handleMilestoneComplete = async (milestoneIndex: number) => {
    if (!project) return;

    try {
      const token = localStorage.getItem('token');
      const newProgress = milestoneIndex + 1;
      const progressPercentage = Math.round((newProgress / project.milestones.length) * 100);

      setCurrentMilestone(newProgress);
      setProject(prev => prev ? { ...prev, progress: progressPercentage } : null);
      
      await fetch('/api/user/activities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'milestone_complete',
          description: `Completed milestone: ${project.milestones[milestoneIndex]}`,
          metadata: { 
            projectId: project._id, 
            milestone: newProgress,
            totalMilestones: project.milestones.length 
          }
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

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
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-muted-foreground text-lg mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline">{tech}</Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{project.estimatedHours} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>{project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}</span>
          </div>
        </div>

        {project.status === 'not_started' ? (
          <Button onClick={handleStartProject} size="lg">
            <Play className="w-4 h-4 mr-2" />
            Start Project
          </Button>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.learningGoals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-1 text-green-500" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentMilestone 
                      ? 'bg-green-500 text-white' 
                      : index === currentMilestone 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentMilestone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`${
                      index < currentMilestone ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {milestone}
                    </p>
                    {project.status === 'in_progress' && index === currentMilestone && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleMilestoneComplete(index)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
