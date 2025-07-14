'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function LandingClient() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description: "Every learning path is uniquely crafted by AI based on your skills, goals, and learning style.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Code,
      title: "Real Project Portfolio",
      description: "Build actual projects that matter. No more boring tutorials - create real-world applications.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageCircle,
      title: "24/7 AI Mentor",
      description: "Your personal AI mentor knows everything about you and provides instant, contextual help.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Multi-Resource Learning",
      description: "Learn from videos, documentation, live coding, discussions - choose what works for you.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const learningMethods = [
    { icon: Youtube, label: "Video Tutorials", color: "text-red-500" },
    { icon: MessageCircle, label: "AI Chatbot", color: "text-blue-500" },
    { icon: BookOpen, label: "Documentation", color: "text-green-500" },
    { icon: Github, label: "Code Examples", color: "text-gray-700" },
    { icon: Users, label: "Community", color: "text-purple-500" },
    { icon: PlayCircle, label: "Interactive Coding", color: "text-orange-500" }
  ];

  return (
    <div ref={ref} className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"
        >
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
        
        <motion.div
          style={{ y: textY }}
          className="relative z-10 text-center text-white max-w-6xl mx-auto px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-white/20 text-white border-white/30">
              <Sparkles className="mr-2 h-5 w-5" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Learn by
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Building</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Transform your skills with personalized, project-based learning powered by AI. 
            Build real applications while getting instant, intelligent guidance every step of the way.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Link href="/signup">
              <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                Start Learning Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-800 px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-8 flex items-center justify-center space-x-2 text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-white" />
              ))}
            </div>
            <span className="text-sm">Join 10,000+ learners</span>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      <main>
        {/* Features Overview */}
        <section className="py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience learning that adapts to you, not the other way around
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-lg leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Methods */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Learn Your Way
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose from multiple learning formats, all integrated seamlessly
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {learningMethods.map((method, index) => (
                <motion.div
                  key={method.label}
                  className="text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <method.icon className={`h-12 w-12 mx-auto mb-4 ${method.color} group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="font-semibold text-lg">{method.label}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
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
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-gray-800 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                  Get Started Now
                  <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
