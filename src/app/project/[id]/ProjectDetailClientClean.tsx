'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Code, 
  FileText, 
  Lightbulb,
  CheckCircle,
  Circle,
  Target,
  TrendingUp,
  MessageSquare,
  Share2,
  Download,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIChatbot from '@/components/AIChatbot';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  enrolledUsers: number;
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  progress: number;
  roadmap: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    type: 'lesson' | 'exercise' | 'project';
    estimatedTime: string;
  }>;
  technologies: string[];
  prerequisites: string[];
}

export default function ProjectDetailClientClean() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProject: ProjectData = {
        id: projectId,
        title: 'Full-Stack Web Development with React & Node.js',
        description: 'Learn to build modern web applications using React, Node.js, Express, and MongoDB. This comprehensive course covers frontend and backend development, including authentication, database design, and deployment.',
        category: 'Web Development',
        difficulty: 'Intermediate',
        duration: '12 weeks',
        rating: 4.8,
        enrolledUsers: 2340,
        instructor: {
          name: 'Sarah Johnson',
          avatar: '/api/placeholder/40/40',
          title: 'Senior Full-Stack Developer'
        },
        progress: 35,
        roadmap: [
          {
            id: '1',
            title: 'Introduction to Full-Stack Development',
            description: 'Overview of the development stack and project setup',
            completed: true,
            type: 'lesson',
            estimatedTime: '2 hours'
          },
          {
            id: '2',
            title: 'React Fundamentals',
            description: 'Components, props, state, and event handling',
            completed: true,
            type: 'lesson',
            estimatedTime: '4 hours'
          },
          {
            id: '3',
            title: 'Building Your First Component',
            description: 'Hands-on exercise creating reusable components',
            completed: true,
            type: 'exercise',
            estimatedTime: '1 hour'
          },
          {
            id: '4',
            title: 'Node.js and Express Setup',
            description: 'Setting up the backend server and API routes',
            completed: false,
            type: 'lesson',
            estimatedTime: '3 hours'
          },
          {
            id: '5',
            title: 'Database Integration',
            description: 'Connecting MongoDB and designing schemas',
            completed: false,
            type: 'lesson',
            estimatedTime: '3 hours'
          },
          {
            id: '6',
            title: 'Authentication System',
            description: 'Implementing user login and registration',
            completed: false,
            type: 'project',
            estimatedTime: '5 hours'
          }
        ],
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML', 'CSS'],
        prerequisites: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals', 'Git basics']
      };
      
      setProject(mockProject);
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoadmapIcon = (type: string, completed: boolean) => {
    const iconClass = completed ? 'text-green-600' : 'text-gray-400';
    
    switch (type) {
      case 'lesson':
        return <BookOpen className={`h-4 w-4 ${iconClass}`} />;
      case 'exercise':
        return <Code className={`h-4 w-4 ${iconClass}`} />;
      case 'project':
        return <Target className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Circle className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600">The project you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                  <p className="text-blue-100 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Badge className={getDifficultyColor(project.difficulty)}>
                      {project.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {project.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      {project.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.enrolledUsers.toLocaleString()} enrolled
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={project.instructor.avatar} />
                      <AvatarFallback>{project.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <p className="font-semibold">{project.instructor.name}</p>
                      <p className="text-blue-200 text-sm">{project.instructor.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Your Progress</span>
                  <span>{project.progress}% Complete</span>
                </div>
                <Progress value={project.progress} className="h-2 bg-blue-500" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="code">Code Environment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      What You'll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Build modern, responsive web applications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Master React hooks and state management
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Create RESTful APIs with Node.js and Express
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Implement user authentication and authorization
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Deploy applications to production
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {project.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Circle className="h-3 w-3 fill-current text-gray-400" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="roadmap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Learning Roadmap
                    </CardTitle>
                    <CardDescription>
                      Follow this structured path to master the skills
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {project.roadmap.map((item, index) => (
                          <motion.div
                            key={item.id}
                            className={`p-4 rounded-lg border ${
                              item.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getRoadmapIcon(item.type, item.completed)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {item.estimatedTime}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {item.type}
                                  </Badge>
                                  {item.completed && (
                                    <span className="text-green-600 text-xs font-medium">Completed</span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant={item.completed ? "outline" : "default"}
                                className="flex-shrink-0"
                              >
                                {item.completed ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-1" />
                                    Start
                                  </>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="code" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Virtual Code Environment
                    </CardTitle>
                    <CardDescription>
                      Practice coding in a sandboxed environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm h-64 overflow-auto">
                      <div className="mb-2">// Welcome to the Code Environment</div>
                      <div className="mb-2">// This is where you can practice coding</div>
                      <div className="mb-4">// Start with a simple React component:</div>
                      <div className="text-blue-400">import React from 'react';</div>
                      <div className="text-blue-400">import {'{ useState }'} from 'react';</div>
                      <div className="mt-2 text-yellow-400">function App() {'{'}</div>
                      <div className="ml-4 text-yellow-400">const [count, setCount] = useState(0);</div>
                      <div className="mt-2 ml-4 text-yellow-400">return (</div>
                      <div className="ml-8 text-green-400">&lt;div&gt;</div>
                      <div className="ml-12 text-green-400">&lt;h1&gt;Count: {'{'}{'{count}'}{'}'}&lt;/h1&gt;</div>
                      <div className="ml-12 text-green-400">&lt;button onClick={'{'}{'{() => setCount(count + 1)}'}{'}'}&gt;</div>
                      <div className="ml-16 text-green-400">Increment</div>
                      <div className="ml-12 text-green-400">&lt;/button&gt;</div>
                      <div className="ml-8 text-green-400">&lt;/div&gt;</div>
                      <div className="ml-4 text-yellow-400">);</div>
                      <div className="text-yellow-400">{'}'}</div>
                      <div className="mt-2 text-blue-400">export default App;</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Run Code
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Right Column - AI Chatbot */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Learning Assistant
                </CardTitle>
                <CardDescription>
                  Get personalized help and explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AIChatbot 
                  context={{
                    currentProject: project.title,
                    userLevel: project.difficulty,
                    learningGoals: ['Full-Stack Development', 'React', 'Node.js']
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
