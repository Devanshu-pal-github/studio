'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, GitMerge, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function LandingClient() {
  const featureAnimation = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-56">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2"
                >
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Unlock Your Potential with Personalized Learning
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our platform provides a unique, AI-driven learning experience tailored to your individual needs and goals. Stop wandering and start building.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href="/login">
                    <Button size="lg" className="group">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">A Smarter Way to Learn</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    We leverage AI to create a learning experience that's as unique as you are. From custom roadmaps to intelligent support, we've got you covered.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <motion.div {...featureAnimation} className="grid gap-1 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                        <GitMerge className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold">Personalized Paths</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No more one-size-fits-all. We analyze your goals and skills to generate a custom project-based roadmap just for you.
                </p>
              </motion.div>
              <motion.div {...featureAnimation} transition={{...featureAnimation.transition, delay: 0.2}} className="grid gap-1 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                        <Bot className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold">AI-Powered Mentor</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Stuck on a problem? Our RAG-powered chatbot has the context of your project and goals to provide instant, intelligent help.
                </p>
              </motion.div>
              <motion.div {...featureAnimation} transition={{...featureAnimation.transition, delay: 0.4}} className="grid gap-1 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                        <BookOpen className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold">Integrated Resources</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Access tutorials, docs, videos, and community threads from across the web, all seamlessly integrated into your workspace.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <motion.div {...featureAnimation} className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Start Your Journey?</h2>
                    <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                        Create an account to get your personalized roadmap and start building projects that matter.
                    </p>
                </motion.div>
                <motion.div {...featureAnimation} transition={{...featureAnimation.transition, delay: 0.2}} className="mx-auto w-full max-w-sm space-y-2">
                    <Link href="/login">
                        <Button size="lg" className="w-full group">
                            Sign Up for Free
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
      </main>
    </div>
  );
}
