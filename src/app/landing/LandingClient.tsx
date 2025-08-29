'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Optimized data structures
const techStack = [
  { name: 'React', icon: Code, description: 'Modern UI Framework' },
  { name: 'Next.js', icon: Rocket, description: 'Full-Stack Framework' },
  { name: 'TypeScript', icon: Code2, description: 'Type-Safe JavaScript' },
  { name: 'Tailwind CSS', icon: Palette, description: 'Utility-First CSS' },
  { name: 'Framer Motion', icon: MousePointer, description: 'Animation Library' },
  { name: 'MongoDB', icon: Database, description: 'NoSQL Database' },
];

const achievements = [
  { icon: Trophy, title: '10,000+ Learners', description: 'Active community' },
  { icon: Star, title: '4.9/5 Rating', description: 'User satisfaction' },
  { icon: Zap, title: '50+ Projects', description: 'Real-world applications' },
  { icon: Target, title: '95% Success Rate', description: 'Learning completion' },
];

const learningPaths = [
  { icon: Code, title: 'Web Development', description: 'Full-stack web apps', color: 'from-blue-500 to-purple-500' },
  { icon: Smartphone, title: 'Mobile Development', description: 'iOS & Android apps', color: 'from-green-500 to-teal-500' },
  { icon: Brain, title: 'AI & Machine Learning', description: 'Intelligent systems', color: 'from-purple-500 to-pink-500' },
  { icon: Database, title: 'Data Science', description: 'Analytics & insights', color: 'from-orange-500 to-red-500' },
];

const interactiveFeatures = [
  { icon: Bot, title: 'AI-Powered Learning', description: 'Personalized guidance' },
  { icon: GitMerge, title: 'Real Projects', description: 'Build actual applications' },
  { icon: MessageCircle, title: 'Community Support', description: 'Learn together' },
  { icon: BarChart3, title: 'Progress Tracking', description: 'Monitor your growth' },
];

export default function LandingClient() {
  const { user, verifying } = useAuth();
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Optimized parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Simplified mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-inter">
      {verifying && (
        <div className="fixed top-0 inset-x-0 z-50">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <div className="rounded-xl border border-blue-200/60 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 backdrop-blur-sm flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Loading your status…
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2 rounded-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI-Powered Learning Platform
                </Badge>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="text-gray-900 dark:text-white">E-LEARNING</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  INDUSTRY
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Transform your skills with personalized, project-based learning powered by AI. 
                Build real applications while getting instant, intelligent guidance every step of the way.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Link href={user ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                    {user ? "Go to Dashboard" : "Get Started Now"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300">
                    Watch Demo
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-6 text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
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
            
            {/* Right Side - Simplified Illustration */}
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
                <div className="absolute top-10 right-10 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-400 rounded-full shadow-lg" />
                <div className="absolute bottom-32 right-32 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded-full shadow-lg" />
                <div className="absolute top-40 left-20 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-lg" />
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
                Powered by Modern Technologies
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built with cutting-edge technologies for the best learning experience
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

        {/* Achievements Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Why Choose StudoAI?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Join thousands of learners who have transformed their careers
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <achievement.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Paths Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
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
                Specialized tracks designed for your career goals
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.title}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${path.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <path.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{path.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 dark:text-gray-400">{path.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Features Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
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
                Experience learning like never before with our advanced features
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {interactiveFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Skills?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who have already transformed their careers with AI-powered learning
              </p>
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  {user ? "Go to Dashboard" : "Start Learning Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl">StudoAI</span>
              </div>
              <p className="text-gray-400">
                Empowering learners with AI-powered education for the future.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/onboarding" className="hover:text-white transition-colors">Onboarding</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <TwitterIcon className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <LinkedinIcon className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 StudoAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
