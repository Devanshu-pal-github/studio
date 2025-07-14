'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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

      // For now, create mock project data based on ID
      // TODO: Replace with actual API call when project details API is implemented
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
      setCurrentMilestone(0);
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
      
      // Log activity
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
      
      // Log activity
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

  const progressPercentage = Math.round((currentMilestone / project.milestones.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                  <p className="text-gray-600 text-lg">{project.description}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={project.status === 'completed' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {project.estimatedHours} hours
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Learning Goals</h3>
                  <ul className="text-sm text-gray-600">
                    {project.learningGoals.map((goal, index) => (
                      <li key={index} className="flex items-center">
                        <Star className="h-3 w-3 mr-2" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <Progress value={progressPercentage} className="mt-2" />
              <p className="text-sm text-gray-600 mt-1">
                {currentMilestone} of {project.milestones.length} milestones completed ({progressPercentage}%)
              </p>
            </CardHeader>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              {project.status === 'not_started' && (
                <Button onClick={handleStartProject} className="w-fit">
                  <Play className="h-4 w-4 mr-2" />
                  Start Project
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-4 rounded-lg border ${
                      index < currentMilestone 
                        ? 'bg-green-50 border-green-200' 
                        : index === currentMilestone
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {index < currentMilestone ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className={`h-6 w-6 rounded-full border-2 ${
                          index === currentMilestone ? 'border-blue-600' : 'border-gray-300'
                        }`} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{milestone}</h4>
                    </div>
                    {index === currentMilestone && project.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleMilestoneComplete(index)}
                      >
                        Complete
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

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
