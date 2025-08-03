'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  ArrowRight, 
  Bot, 
  GitMerge, 
  BookOpen, 
  Brain,
  Rocket,
  Target,
  Users,
  Code,
  Zap,
  MessageCircle,
  Youtube,
  Github,
  Star,
  CheckCircle,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
  Lightbulb,
  Award,
  Clock,
  BarChart3,
  Heart,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Search,
  ChevronRight,
  ArrowUpRight,
  Download,
  BookOpen as BookOpenIcon,
  GraduationCap,
  Briefcase,
  UserCheck,
  Settings,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
  Cpu,
  Database,
  Cloud,
  Layers,
  Activity,
  Target as TargetIcon,
  Zap as ZapIcon,
  Brain as BrainIcon,
  Code2,
  Terminal,
  GitBranch,
  Database as DatabaseIcon,
  Server,
  Network,
  Cpu as CpuIcon,
  BarChart,
  PieChart,
  LineChart,
  Calendar,
  Clock as ClockIcon,
  Award as AwardIcon,
  Trophy,
  Medal,
  BookOpen as BookOpenIcon2,
  Video,
  FileText,
  Headphones,
  Mic,
  Camera,
  Palette,
  Music,
  Gamepad2,
  Smartphone as SmartphoneIcon,
  Laptop,
  Tablet,
  Watch,
  Headphones as HeadphonesIcon,
  Wifi,
  Bluetooth,
  Battery,
  Wifi as WifiIcon,
  Signal,
  Zap as ZapIcon2,
  Flame,
  Sun,
  Moon,
  Star as StarIcon,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Plus,
  Minus,
  Divide,
  Equal,
  Infinity,
  Pi,
  Sigma
} from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

export default function LandingClient() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized learning paths crafted by advanced AI algorithms using Google Gemini API",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      delay: 0.1,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code,
      title: "Real Projects",
      description: "Build actual applications that matter in the real world with hands-on experience",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      delay: 0.2,
      gradient: "from-teal-500 to-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "24/7 AI Mentor",
      description: "Get instant help and guidance whenever you need it with context-aware AI",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      delay: 0.3,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Multi-Format Learning",
      description: "Learn through videos, docs, coding, and discussions seamlessly integrated",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      delay: 0.4,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Learners", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { number: "500+", label: "Real Projects", icon: Code, color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-900/20" },
    { number: "24/7", label: "AI Support", icon: Bot, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { number: "95%", label: "Success Rate", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" }
  ];

  const learningMethods = [
    { icon: Youtube, label: "Video Tutorials", color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-900/20" },
    { icon: MessageCircle, label: "AI Chatbot", color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { icon: BookOpen, label: "Documentation", color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { icon: Github, label: "Code Examples", color: "text-gray-700", bgColor: "bg-gray-50 dark:bg-gray-800" },
    { icon: Users, label: "Community", color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { icon: PlayCircle, label: "Interactive Coding", color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20" }
  ];

  const quickActions = [
    { icon: BookOpenIcon, label: "Browse Courses", href: "/courses", color: "text-blue-600" },
    { icon: GraduationCap, label: "Start Learning", href: "/signup", color: "text-teal-600" },
    { icon: Briefcase, label: "View Projects", href: "/projects", color: "text-purple-600" },
    { icon: UserCheck, label: "Join Community", href: "/community", color: "text-orange-600" }
  ];

  const techStack = [
    { icon: Cpu, name: "AI/ML", description: "Google Gemini API" },
    { icon: Database, name: "Database", description: "Firebase Firestore" },
    { icon: Cloud, name: "Cloud", description: "Google Cloud Platform" },
    { icon: Layers, name: "Frontend", description: "React & Next.js" },
    { icon: Server, name: "Backend", description: "FastAPI & Python" },
    { icon: Network, name: "Deployment", description: "Vercel & Firebase" }
  ];

  const learningPaths = [
    {
      title: "Frontend Development",
      description: "Master React, Next.js, and modern web technologies",
      icon: Monitor,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      duration: "6-8 months",
      projects: 12,
      difficulty: "Beginner to Advanced"
    },
    {
      title: "Backend Engineering",
      description: "Build robust APIs and server-side applications",
      icon: Server,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      duration: "8-10 months",
      projects: 15,
      difficulty: "Intermediate to Advanced"
    },
    {
      title: "Full Stack Development",
      description: "Complete end-to-end application development",
      icon: Code,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      duration: "10-12 months",
      projects: 20,
      difficulty: "Advanced"
    },
    {
      title: "AI & Machine Learning",
      description: "Integrate AI into your applications",
      icon: Brain,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      duration: "8-10 months",
      projects: 10,
      difficulty: "Intermediate to Advanced"
    }
  ];

  const achievements = [
    { icon: Trophy, title: "Industry Recognition", description: "Awarded by top tech companies", count: "50+" },
    { icon: Award, title: "Certifications", description: "Industry-standard certifications", count: "25+" },
    { icon: Medal, title: "Competitions Won", description: "Hackathons and coding challenges", count: "100+" },
    { icon: Award, title: "Job Placements", description: "Successful career transitions", count: "500+" }
  ];

  const interactiveFeatures = [
    {
      title: "Real-time Code Editor",
      description: "Write, test, and debug code in real-time with instant feedback",
      icon: Code2,
      features: ["Syntax highlighting", "Auto-completion", "Error detection", "Live preview"]
    },
    {
      title: "AI Code Review",
      description: "Get instant feedback on your code quality and best practices",
      icon: Bot,
      features: ["Performance analysis", "Security checks", "Style guidelines", "Optimization tips"]
    },
    {
      title: "Collaborative Learning",
      description: "Work with peers on projects and share knowledge",
      icon: Users,
      features: ["Pair programming", "Code sharing", "Peer reviews", "Team projects"]
    },
    {
      title: "Progress Analytics",
      description: "Track your learning journey with detailed analytics",
      icon: BarChart,
      features: ["Skill assessment", "Learning curves", "Time tracking", "Goal setting"]
    }
  ];

  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden font-inter">
      {/* New Hero Section with Soft Matte Finish */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Soft Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20" />
        
        {/* Soft Organic Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6"
              >
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI-Powered Learning Platform
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <span className="text-gray-900 dark:text-white">E-LEARNING</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">INDUSTRY</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Transform your skills with personalized, project-based learning powered by AI. 
                Build real applications while getting instant, intelligent guidance every step of the way.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Link href="/signup">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300">
                    Watch Demo
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center lg:justify-start space-x-6 text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 border-2 border-white dark:border-gray-800"
                      />
                    ))}
                  </div>
                  <span className="text-sm">Join 10,000+ learners</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Isometric Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-[500px]">
                {/* Desktop Computer */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-64 h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl">
                  <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Books Stack */}
                <div className="absolute bottom-20 left-10 w-20 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg transform rotate-12" />
                <div className="absolute bottom-16 left-8 w-20 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg transform rotate-6" />
                <div className="absolute bottom-12 left-6 w-20 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg shadow-lg" />
                
                {/* Graduation Cap */}
                <div className="absolute top-32 right-20 w-16 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-lg transform rotate-12" />
                
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-400 rounded-full shadow-lg animate-pulse" />
                <div className="absolute bottom-32 right-32 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded-full shadow-lg animate-pulse delay-1000" />
                <div className="absolute top-40 left-20 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-lg animate-pulse delay-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main>
        {/* Tech Stack Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Powered by Google Technologies
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built with cutting-edge Google AI and cloud technologies
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <tech.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section with Enhanced Animations */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Paths Section - New Varied Layout */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Choose Your Learning Path
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Structured learning paths designed for real-world success
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group"
                >
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${path.bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <path.icon className={`h-8 w-8 ${path.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{path.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{path.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{path.duration}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{path.projects}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{path.difficulty}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
                      </div>
                    </div>
                    
                    <Link href="/signup">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-2xl transition-all duration-300 shadow-lg">
                        Start Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Features Section - Timeline Layout */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Interactive Learning Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience learning like never before with cutting-edge tools
              </p>
            </motion.div>

            <div className="space-y-12">
              {interactiveFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col items-center gap-8`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl p-8 h-64 flex items-center justify-center shadow-lg">
                      <feature.icon className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Section - Grid Layout */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Student Achievements
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Real results from our community of learners
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <achievement.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{achievement.count}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Methods with Enhanced Interactions */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800/50 dark:to-gray-700/50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Learn Your Way
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose from multiple learning formats, all integrated seamlessly
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {learningMethods.map((method, index) => (
                <motion.div
                  key={method.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <div className="text-center p-6 hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r ${method.bgColor.replace('bg-', 'from-').replace('dark:bg-', 'to-')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${method.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10 shadow-lg`}>
                      <method.icon className={`h-8 w-8 ${method.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white relative z-10">{method.label}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
                Join thousands of learners who are building real skills through personalized, AI-guided projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group relative overflow-hidden">
                    <span className="relative z-10">Get Started Now</span>
                    <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform relative z-10" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300 backdrop-blur-sm">
                    Watch Demo
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">StudoAI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Transform your skills with AI-powered, project-based learning.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/courses" className="hover:text-gray-900 dark:hover:text-white transition-colors">Courses</Link></li>
                <li><Link href="/projects" className="hover:text-gray-900 dark:hover:text-white transition-colors">Projects</Link></li>
                <li><Link href="/ai-mentor" className="hover:text-gray-900 dark:hover:text-white transition-colors">AI Mentor</Link></li>
                <li><Link href="/community" className="hover:text-gray-900 dark:hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/press" className="hover:text-gray-900 dark:hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/help" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 StudoAI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/twitter" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </Link>
              <Link href="/linkedin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </Link>
              <Link href="/github" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
