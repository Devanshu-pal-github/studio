'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Star, 
  GitBranch, 
  Calendar,
  Trophy,
  BookOpen,
  Code,
  Users,
  MessageSquare,
  BarChart3,
  Flame,
  CheckCircle2,
  PlayCircle,
  // PauseCircle,
  RefreshCw,
  Brain,
  ArrowRight
} from 'lucide-react';
// Remove direct imports that contain MongoDB code - use API calls instead
// import { activityTracker, UserProgress, UserActivity } from '@/lib/activityTracker';
// import { aiRecommendationEngine, ProjectRecommendation, LearningPath } from '@/lib/aiRecommendationEngine';
// import { projectTracker, ProjectProgress } from '@/lib/projectTracker';

// Define types locally for now
interface UserProgress {
  totalPoints: number;
  level: number;
  streak: number;
  activeDays: number;
  completedProjects: string[];
  currentProjects: string[];
  achievements: string[];
  weeklyGoals: {
    targetProjects: number;
    targetPoints: number;
    currentProjects: number;
    currentPoints: number;
  };
  skillsProgress: { [skill: string]: number };
}

interface UserActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  metadata: any;
}

interface ProjectRecommendation {
  id?: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  skills: string[];
  technologies?: string[];
  personalizedReason?: string;
  matchScore?: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  projects: ProjectRecommendation[];
  totalProjects?: number;
  estimatedWeeks?: number;
  adaptiveNotes?: string[];
}

interface ProjectProgress {
  id: string;
  projectId: string;
  status: 'in_progress' | 'not_started' | 'paused' | 'completed';
  startedAt: Date;
  currentMilestone: number;
  title: string;
  description: string;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  technologies: string[];
  learningGoals: string[];
  milestones: string[];
  challenges: string[];
  learnings: string[];
}
import ActivityHeatmap from './ActivityHeatmap';
import ProjectTrackerDashboard from './ProjectTrackerDashboard';
import AdvancedRAGChatbot from './AdvancedRAGChatbot';

interface DashboardData {
  userProgress: UserProgress | null;
  recentActivities: UserActivity[];
  recommendations: ProjectRecommendation[];
  learningPath: LearningPath | null;
  userProjects: ProjectProgress[];
  personalizedContent?: {
    profileSummary: string;
    nextSteps: string[];
    motivationalMessage: string;
  };
  profileSnapshot?: {
    name: string;
    email: string;
    experience: string;
    goals: string[];
    interests: string[];
    completedOnboarding: boolean;
    streak: number;
    level: number;
    points: number;
  };
}

export default function DynamicDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userProgress: null,
    recentActivities: [],
    recommendations: [],
    learningPath: null,
    userProjects: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Load dashboard data from the API (personalized content)
      const dashboardResponse = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let personalizedRecommendations: ProjectRecommendation[] = [];
      let profileSummary = '';
      let nextSteps: string[] = [];
      let motivationalMessage = '';

      if (dashboardResponse.ok) {
        const dashboardApiData = await dashboardResponse.json();
        console.log('AI-generated dashboard data loaded:', dashboardApiData);
        
        if (dashboardApiData.personalizedData) {
          personalizedRecommendations = dashboardApiData.personalizedData.projectRecommendations?.map((project: any, index: number) => ({
            id: `ai-${index}`,
            title: project.title,
            description: project.description,
            difficulty: project.difficulty,
            estimatedHours: project.estimatedHours,
            skills: project.skills || [],
            personalizedReason: project.personalizedReason,
            matchScore: project.matchScore
          })) || [];
          
          profileSummary = dashboardApiData.personalizedData.profileSummary || '';
          nextSteps = dashboardApiData.personalizedData.nextSteps || [];
          motivationalMessage = dashboardApiData.personalizedData.motivationalMessage || '';
        }
      }

      // Load user progress
      const progressResponse = await fetch('/api/user/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const progressData = progressResponse.ok ? await progressResponse.json() : { progress: null };

      // Load recent activities
      const activitiesResponse = await fetch('/api/user/activities?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const activitiesData = activitiesResponse.ok ? await activitiesResponse.json() : { activities: [] };

      // Load personalized projects
      const projectsResponse = await fetch('/api/user/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const projectsData = projectsResponse.ok ? await projectsResponse.json() : { projects: [] };

      // Load profile snapshot
      const profileResponse = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const profileData = profileResponse.ok ? await profileResponse.json() : { profile: null };

      // Use AI-generated recommendations if available, otherwise fallback
      const finalRecommendations = personalizedRecommendations.length > 0 ? personalizedRecommendations : [
        {
          id: '1',
          title: 'Build a Personal Portfolio Website',
          description: 'Create a responsive portfolio to showcase your skills',
          difficulty: 'medium',
          estimatedHours: 15,
          skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        },
        {
          id: '2',
          title: 'Todo App with Local Storage',
          description: 'Build a task management app with persistent data',
          difficulty: 'easy',
          estimatedHours: 8,
          skills: ['JavaScript', 'DOM', 'Local Storage'],
        },
      ];

      const learningPath: LearningPath = {
        id: '1',
        title: 'Your Personalized Learning Path',
        description: profileSummary || 'Complete path tailored to your goals and interests',
        projects: finalRecommendations,
        totalProjects: finalRecommendations.length,
        estimatedWeeks: Math.ceil(finalRecommendations.reduce((total, p) => total + p.estimatedHours, 0) / 10),
        adaptiveNotes: nextSteps,
      };

      // Map projects data to ProjectProgress format
      const userProjectsData: ProjectProgress[] = projectsData.projects?.map((project: any) => ({
        id: project._id,
        projectId: project._id,
        status: (project.status === 'in_progress' || project.status === 'paused' || project.status === 'completed') 
          ? project.status 
          : 'not_started' as const,
        startedAt: project.createdAt ? new Date(project.createdAt) : new Date(),
        currentMilestone: project.progress || 0,
        title: project.title,
        description: project.description,
        progress: project.progress || 0,
        estimatedHours: project.estimatedHours || 15,
        actualHours: project.actualHours || 0,
        technologies: project.technologies || [],
        learningGoals: project.learningGoals || [],
        milestones: project.milestones || [],
        challenges: project.challenges || [],
        learnings: project.learnings || [],
      })) || [];

      setDashboardData({
        userProgress: progressData.success ? progressData.progress : null,
        recentActivities: activitiesData.success ? activitiesData.activities : [],
        recommendations: finalRecommendations,
        learningPath: learningPath,
        userProjects: userProjectsData,
        personalizedContent: {
          profileSummary,
          nextSteps,
          motivationalMessage,
        },
  profileSnapshot: profileData.success ? profileData.profile : undefined,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProject = async (projectId: string) => {
    if (!user) return;
    
    setActiveProject(projectId);
    
    try {
      // Start tracking the project via API
      const token = localStorage.getItem('token');
      const projectResponse = await fetch('/api/user/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          projectId,
          estimatedHours: 20,
          status: 'in_progress'
        })
      });
      if (!projectResponse.ok) throw new Error('Failed to start project');

      // Log activity via API
      const activityResponse = await fetch('/api/user/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          type: 'project_start',
          description: `Started project: ${projectId}`,
          metadata: { projectId, difficulty: 'medium' }
        })
      });
      if (!activityResponse.ok) throw new Error('Failed to log activity');
      
      // Refresh dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error starting project:', error);
    }
  };

  const handleProjectFeedback = (projectId: string, feedback: any) => {
    // This would open a feedback modal
    console.log('Feedback for project:', projectId, feedback);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const { userProgress, recentActivities, recommendations, learningPath, userProjects } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name || 'Developer'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Level {userProgress?.level || 1} • {userProgress?.totalPoints || 0} points
                </p>
                {dashboardData.personalizedContent?.motivationalMessage && (
                  <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">
                    {dashboardData.personalizedContent.motivationalMessage}
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress?.streak || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress?.completedProjects?.length || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userProgress?.activeDays || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Days</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Personalized Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Recommended for You</span>
                      <Badge variant="secondary" className="ml-auto">
                        AI Powered
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.slice(0, 3).map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {project.description}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              {project.personalizedReason || project.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-3">
                              {(() => {
                                const diff = project.difficulty;
                                let variant: any = 'destructive';
                                if (diff === 'easy') {
                                  variant = 'secondary';
                                } else if (diff === 'medium') {
                                  variant = 'default';
                                }
                                return <Badge variant={variant}>{project.difficulty}</Badge>;
                              })()}
                              {project.matchScore && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {project.matchScore}% match
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {project.estimatedHours}h
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Star className="h-4 w-4 mr-1" />
                                {Math.round(project.matchScore || 85)}% match
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {(project.skills || project.technologies || []).slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => project.id && handleStartProject(project.id)}
                              disabled={activeProject === project.id || !project.id}
                              className="bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                              {activeProject === project.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => project.id && handleProjectFeedback(project.id, 'interested')}
                              disabled={!project.id}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Feedback
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity & Progress */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Profile Snapshot */}
                {dashboardData.profileSnapshot && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span>Profile Snapshot</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{dashboardData.profileSnapshot.experience}</span></div>
                      <div>
                        <span className="text-gray-500">Goals</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(dashboardData.profileSnapshot.goals || []).slice(0,4).map((g) => (
                            <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Interests</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(dashboardData.profileSnapshot.interests || []).slice(0,4).map((i) => (
                            <Badge key={i} variant="outline" className="text-xs">{i}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="text-center">
                          <div className="text-xl font-bold">{dashboardData.profileSnapshot.level}</div>
                          <div className="text-xs text-gray-500">Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{dashboardData.profileSnapshot.points}</div>
                          <div className="text-xs text-gray-500">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{dashboardData.profileSnapshot.streak}</div>
                          <div className="text-xs text-gray-500">Streak</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Current Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5 text-green-600" />
                      <span>Active Projects</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userProgress?.currentProjects?.length ? (
                      <div className="space-y-3">
                        {userProgress.currentProjects.slice(0, 3).map((projectId) => (
                          <div key={projectId} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">Project {projectId}</p>
                              <Progress value={Math.random() * 100} className="w-full h-2 mt-1" />
                            </div>
                            <Button size="sm" variant="ghost">
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No active projects. Start one from recommendations!
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* AI Personalized Insights */}
                {dashboardData.personalizedContent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <span>Your Learning Journey</span>
                        <Badge variant="secondary" className="ml-auto">
                          AI Insights
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData.personalizedContent.profileSummary && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                            Profile Summary
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {dashboardData.personalizedContent.profileSummary}
                          </p>
                        </div>
                      )}
                      
                      {dashboardData.personalizedContent.nextSteps.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Recommended Next Steps
                          </h4>
                          <ul className="space-y-1">
                            {dashboardData.personalizedContent.nextSteps.slice(0, 3).map((step) => (
                              <li key={step} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {activity.type === 'project_start' && (
                              <PlayCircle className="h-4 w-4 text-blue-500" />
                            )}
                            {activity.type === 'project_complete' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {activity.type === 'code_commit' && (
                              <GitBranch className="h-4 w-4 text-purple-500" />
                            )}
                            {activity.type === 'lesson_complete' && (
                              <BookOpen className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <ProjectTrackerDashboard 
              projects={userProjects} 
              onProjectUpdate={loadDashboardData}
            />
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning-path">
            {learningPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>{learningPath.title}</span>
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      {learningPath.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <Badge variant="secondary">
                        {learningPath.totalProjects} projects
                      </Badge>
                      <Badge variant="secondary">
                        ~{learningPath.estimatedWeeks} weeks
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {learningPath.adaptiveNotes && learningPath.adaptiveNotes.length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium mb-2">Personalized Notes:</h4>
                        <ul className="space-y-1">
                          {learningPath.adaptiveNotes.map((note) => (
                            <li key={note} className="text-sm text-blue-700 dark:text-blue-300">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {learningPath.projects.map((project, index) => (
                        <div key={project.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {project.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{project.difficulty}</Badge>
                              <span className="text-sm text-gray-500">
                                {project.estimatedHours}h
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => project.id && handleStartProject(project.id)}
                            disabled={activeProject === project.id || !project.id}
                          >
                            {activeProject === project.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {/* Activity Heatmap */}
              <ActivityHeatmap userId={user?._id || ''} />
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Level Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Level {userProgress?.level || 1}</span>
                          <span>{userProgress?.totalPoints || 0} points</span>
                        </div>
                        <Progress 
                          value={((userProgress?.totalPoints || 0) % 1000) / 10} 
                          className="h-3" 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {1000 - ((userProgress?.totalPoints || 0) % 1000)} points to next level
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Projects Started</span>
                        <span className="font-bold">
                          {recentActivities.filter(a => a.type === 'project_start').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Lessons Completed</span>
                        <span className="font-bold">
                          {recentActivities.filter(a => a.type === 'lesson_complete').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Code Commits</span>
                        <span className="font-bold">
                          {recentActivities.filter(a => a.type === 'code_commit').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Feedback Given</span>
                        <span className="font-bold">
                          {recentActivities.filter(a => a.type === 'feedback_given').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Community Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Community features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Advanced RAG Chatbot - Available throughout the dashboard with full user context */}
      <AdvancedRAGChatbot 
        user={user}
        userContext={dashboardData.personalizedContent}
        activities={dashboardData.recentActivities}
        projects={dashboardData.userProjects}
        currentProject={activeProject || undefined}
        learningGoals={dashboardData.learningPath?.projects?.map(p => p.title) || []}
        userLevel={dashboardData.userProgress?.level.toString() || 'beginner'}
      />
    </div>
  );
}
