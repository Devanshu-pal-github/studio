"use client";

import { useState } from 'react';
import type { Project } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpen, Youtube, Lightbulb, HelpCircle, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { documentationFinder } from '@/ai/flows/documentation-finder';
import { findYoutubeResources } from '@/ai/flows/resource-integration';
import { contextualAiMentor } from '@/ai/flows/contextual-ai-mentor';
import Link from 'next/link';
import { QuizDialog } from '@/components/QuizDialog';

interface Step {
    id: number;
    title: string;
    actionPlan?: string;
    isCompleted: boolean;
    docs?: string[];
    videos?: string[];
    quiz?: {
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
    };
}

const mockActionPlan: Omit<Step, 'isCompleted' | 'docs' | 'videos'>[] = [
    { 
        id: 1, 
        title: 'Setup Project Environment', 
        actionPlan: "Initialize your project with a `package.json` file. Set up your basic HTML file structure with an `index.html`, a `style.css`, and a `script.js` file. Link your CSS and JS files to your HTML.",
        quiz: {
            question: "What file is used to manage project dependencies in a Node.js project?",
            options: ["index.html", "package.json", "style.css", "script.js"],
            correctAnswer: "package.json",
            explanation: "`package.json` holds metadata relevant to the project and is used for managing dependencies, scripts, and versions."
        }
    },
    { 
        id: 2, 
        title: 'Build HTML Structure', 
        actionPlan: "Lay out the semantic HTML for your portfolio. This should include a header, navigation, sections for 'About Me', 'Projects', and a footer.",
        quiz: {
            question: "Which HTML tag is used to define the most important heading?",
            options: ["<h6>", "<h1>", "<head>", "<heading>"],
            correctAnswer: "<h1>",
            explanation: "The `<h1>` to `<h6>` tags are used to define HTML headings. `<h1>` defines the most important heading."
        }
    },
    { 
        id: 3, 
        title: 'Style with CSS', 
        actionPlan: "Use CSS to style your portfolio. Focus on layout with Flexbox or Grid. Add your color scheme and typography. Ensure it's responsive using media queries.",
        quiz: {
            question: "Which CSS property is used to create space between the content and the border of an element?",
            options: ["margin", "padding", "border", "spacing"],
            correctAnswer: "padding",
            explanation: "Padding is used to create space around an element's content, inside of any defined borders."
        }
    },
    { 
        id: 4, 
        title: 'Add JavaScript Interactivity', 
        actionPlan: "Add some simple JavaScript to make your portfolio interactive. For example, a theme switcher (light/dark mode) or a smooth scrolling effect for navigation links.",
        quiz: {
            question: "How do you select an HTML element with the id 'demo' in JavaScript?",
            options: ["document.querySelector('#demo')", "document.getElement('demo')", "document.select('#demo')", "find.elementById('demo')"],
            correctAnswer: "document.querySelector('#demo')",
            explanation: "`document.querySelector()` is a versatile method to find the first element that matches a specified CSS selector. `getElementById` is also common."
        }
    },
    { 
        id: 5, 
        title: 'Deploy to the Web', 
        actionPlan: "Deploy your finished portfolio to a hosting service like Netlify, Vercel, or GitHub Pages so you can share it with the world.",
        quiz: {
            question: "Which of the following is a popular platform for deploying static websites for free?",
            options: ["AWS S3", "Vercel", "GoDaddy", "DigitalOcean"],
            correctAnswer: "Vercel",
            explanation: "Vercel, Netlify, and GitHub Pages are all popular choices for easily deploying modern frontend projects for free."
        }
    },
];

export default function ProjectDetailClient({ project }: { project: Project }) {
    const [steps, setSteps] = useState<Step[]>(mockActionPlan.map(s => ({ ...s, isCompleted: false })));
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [mentorQuery, setMentorQuery] = useState('');
    const [mentorResponse, setMentorResponse] = useState('');
    const [isMentorLoading, setIsMentorLoading] = useState(false);
    const { toast } = useToast();
    
    const [quizStates, setQuizStates] = useState<Record<number, boolean>>({});
    const [activeQuizStep, setActiveQuizStep] = useState<Step | null>(null);

    const toggleStep = (id: number) => {
        setSteps(steps.map(step => step.id === id ? { ...step, isCompleted: !step.isCompleted } : step));
    };
    
    const handleFetchResources = async (step: Step, type: 'docs' | 'videos') => {
        setIsLoading(prev => ({ ...prev, [`${type}-${step.id}`]: true }));
        try {
            let newResources;
            if (type === 'docs') {
                const response = await documentationFinder({ projectTitle: project.title, stepDescription: step.title, userQuery: `Find documentation for ${step.title}` });
                newResources = response.documentationSnippets;
            } else {
                const response = await findYoutubeResources({ query: `Tutorial for ${project.title} - ${step.title}` });
                newResources = response.videoUrls;
            }
            
            setSteps(steps.map(s => s.id === step.id ? { ...s, [type]: newResources } : s));
            
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: `Failed to fetch ${type}`, description: "There was an issue with the AI. Please try again." });
        } finally {
            setIsLoading(prev => ({ ...prev, [`${type}-${step.id}`]: false }));
        }
    };

    const handleAskMentor = async () => {
        if (!mentorQuery.trim()) return;
        setIsMentorLoading(true);
        setMentorResponse('');
        try {
            const currentStep = steps.find(s => !s.isCompleted) || steps[steps.length - 1];
            const response = await contextualAiMentor({
                userGoal: "Become a Full-Stack Developer",
                userLevel: "beginner",
                projectName: project.title,
                stepNumber: currentStep.id,
                stepDescription: currentStep.title,
                priorSteps: steps.filter(s => s.isCompleted).map(s => s.title),
                priorQuestions: [],
                userQuery: mentorQuery
            });
            setMentorResponse(response.answer);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Error asking mentor", description: "There was an issue with the AI. Please try again." });
        } finally {
            setIsMentorLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary h-6 w-6"/> Your Action Plan</CardTitle>
                    <CardDescription>Follow these steps to complete your project. This plan was generated by your AI mentor. Master each concept by passing the quiz before moving on.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative space-y-6">
                        <div className="absolute left-4 top-4 h-full w-px bg-border -z-10"></div>
                        {steps.map((step) => (
                            <div key={step.id} className="relative pl-10">
                                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary font-bold text-primary">
                                    {step.id}
                                </div>
                                <div className="flex items-center gap-4">
                                    <Checkbox 
                                        id={`step-${step.id}`} 
                                        checked={step.isCompleted} 
                                        onCheckedChange={() => toggleStep(step.id)} 
                                        className="h-5 w-5"
                                        disabled={!!step.quiz && !quizStates[step.id]}
                                    />
                                    <label htmlFor={`step-${step.id}`} className={`text-lg font-medium ${step.isCompleted ? 'line-through text-muted-foreground' : ''} ${!!step.quiz && !quizStates[step.id] ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                        {step.title}
                                    </label>
                                </div>
                                <div className="pl-9">
                                    <p className="text-muted-foreground mt-1">{step.actionPlan}</p>
                                    <div className="mt-4 space-y-4">
                                        {(step.docs || step.videos) && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {step.docs && <Card><CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><BookOpen className="h-4 w-4" /> Docs</CardTitle></CardHeader><CardContent className="text-sm"><ul className="list-disc pl-5 space-y-1">{step.docs.slice(0, 3).map((doc, i) => <li key={i} className="text-muted-foreground">{doc}</li>)}</ul></CardContent></Card>}
                                                {step.videos && <Card><CardHeader className="pb-2"><CardTitle className="text-base font-medium flex items-center gap-2"><Youtube className="h-4 w-4" /> Videos</CardTitle></CardHeader><CardContent className="text-sm"><ul className="list-disc pl-5 space-y-1">{step.videos.slice(0, 3).map((video, i) => <li key={i}><Link href={video} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">{video}</Link></li>)}</ul></CardContent></Card>}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleFetchResources(step, 'docs')} disabled={isLoading['docs-' + step.id]}>{isLoading['docs-' + step.id] ? <Loader2 className="animate-spin"/> : <BookOpen />} Find Docs</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleFetchResources(step, 'videos')} disabled={isLoading['videos-' + step.id]}>{isLoading['videos-' + step.id] ? <Loader2 className="animate-spin"/> : <Youtube />} Find Videos</Button>
                                            {step.quiz && (
                                                <Button variant={quizStates[step.id] ? 'default' : 'secondary'} size="sm" onClick={() => setActiveQuizStep(step)} disabled={quizStates[step.id]}>
                                                    {quizStates[step.id] ? <CheckCircle2Icon /> : <HelpCircle />}
                                                    {quizStates[step.id] ? 'Concept Mastered!' : 'Test Your Knowledge'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full sticky bottom-6" size="lg" variant="default" >
                        <Lightbulb /> Ask Your AI Mentor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Ask Your Mentor</DialogTitle>
                        <DialogDescription>Stuck on something? Ask a question about the current step or a general concept.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea placeholder="e.g., What's the difference between margin and padding in CSS?" value={mentorQuery} onChange={e => setMentorQuery(e.target.value)} />
                    </div>
                    {isMentorLoading && <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin"/><p>Thinking...</p></div>}
                    {mentorResponse && <Alert><Sparkles className="h-4 w-4" /><AlertTitle>Mentor's Response</AlertTitle><AlertDescription className="prose prose-sm max-w-none prose-p:text-muted-foreground">{mentorResponse}</AlertDescription></Alert>}
                    <DialogFooter>
                        <Button onClick={handleAskMentor} disabled={isMentorLoading}>Ask Question</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {activeQuizStep && activeQuizStep.quiz && (
                <QuizDialog
                    isOpen={!!activeQuizStep}
                    onOpenChange={() => setActiveQuizStep(null)}
                    quiz={activeQuizStep.quiz}
                    onQuizComplete={(passed) => {
                        if (passed) {
                            setQuizStates(prev => ({ ...prev, [activeQuizStep.id]: true }));
                        }
                        setActiveQuizStep(null);
                    }}
                />
            )}
        </div>
    );
}
