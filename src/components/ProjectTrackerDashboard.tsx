'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Star, 
  MessageSquare, 
  TrendingUp,
  AlertCircle,
  Target,
  BookOpen,
  Code,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Remove direct import that contains MongoDB code - use API calls instead
// import { projectTracker, ProjectProgress, UserFeedback } from '@/lib/projectTracker';

// Define types locally to avoid MongoDB imports
interface ProjectProgress {
  projectId: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  startDate?: Date;
  endDate?: Date;
  completionDate?: Date;
  feedback?: string;
  challenges: string[];
  learnings: string[];
  technologies: string[];
}

interface UserFeedback {
  projectId: string;
  userId: string;
  rating: number;
  comment: string;
  suggestions: string[];
  wouldRecommend: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number;
  mostValuable: string;
  improvements: string;
  timestamp: Date;
}

interface ProjectTrackerDashboardProps {
  projects: ProjectProgress[];
  onProjectUpdate: () => void;
}

export default function ProjectTrackerDashboard({ projects, onProjectUpdate }: ProjectTrackerDashboardProps) {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(3);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const pausedProjects = projects.filter(p => p.status === 'paused');

  const handleProjectAction = async (projectId: string, action: 'pause' | 'resume' | 'complete') => {
    if (!user) return;

    const project = projects.find(p => p.projectId === projectId);
    if (!project) return;

    try {
      if (action === 'pause') {
        // Use API call instead of direct projectTracker
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paused' })
        });
        if (!response.ok) throw new Error('Failed to pause project');
      } else if (action === 'resume') {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' })
        });
        if (!response.ok) throw new Error('Failed to resume project');
      } else if (action === 'complete') {
        setSelectedProject(projectId);
        setShowFeedbackDialog(true);
        return;
      }
      
      onProjectUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCompleteFeedback = async () => {
    if (!user || !selectedProject) return;

    try {
      // Complete the project via API
      const completeResponse = await fetch(`/api/projects/${selectedProject}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText })
      });
      if (!completeResponse.ok) throw new Error('Failed to complete project');
      
      // Submit feedback via API
      const feedbackResponse = await fetch('/api/user/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'completion_feedback',
          description: 'Project completion feedback',
          metadata: {
            projectId: selectedProject,
            rating: feedbackRating,
            feedback: feedbackText
          }
        })
      });
      if (!feedbackResponse.ok) throw new Error('Failed to submit feedback');

      setShowFeedbackDialog(false);
      setFeedbackText('');
      setFeedbackRating(3);
      setSelectedProject(null);
      onProjectUpdate();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'abandoned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'abandoned': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Projects Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start your first project from the recommendations above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Pause className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pausedProjects.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(projects.reduce((sum, p) => sum + p.progressPercentage, 0) / projects.length) || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Active Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{project.projectId}</h3>
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(project.progressPercentage)}%</span>
                        </div>
                        <Progress value={project.progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {project.actualHours}h / {project.estimatedHours}h
                        </span>
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {project.milestones.filter(m => m.completed).length}/{project.milestones.length} milestones
                        </span>
                      </div>
                    </div>

                    {project.aiRecommendations.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Recommendation:</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {project.aiRecommendations[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProjectAction(project.id, 'pause')}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleProjectAction(project.id, 'complete')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Completed Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedProjects.slice(0, 4).map((project) => (
                <div key={project.id} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">{project.projectId}</h4>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Completed in {project.actualHours}h</p>
                    <p>{project.milestones.length} milestones achieved</p>
                    {project.completionDate && (
                      <p>Finished on {new Date(project.completionDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <AnimatePresence>
        {showFeedbackDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Project Completion Feedback</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How would you rate this project experience?
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFeedbackRating(rating)}
                        className={`p-1 ${
                          rating <= feedbackRating 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Share your experience and learnings:
                  </label>
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What did you learn? What challenges did you face? Any suggestions for improvement?"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteFeedback}
                  disabled={!feedbackText.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Complete Project
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
