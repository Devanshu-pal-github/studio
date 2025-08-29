
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Target, BookOpen, Clock, AlertCircle, Briefcase, Settings } from "lucide-react";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    // No local loading at the moment

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleStartOnboarding = () => {
        router.push('/onboarding');
    };

    const handleGoToLanding = () => {
        router.push('/landing');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }
    
        // Derived profile fields can be added here if needed

    const renderDetailCard = (title: string, value: any, icon: React.ReactNode) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                                {Array.isArray(value) ? (
                                    <div className="flex flex-wrap gap-2">
                                        {(value as string[]).map((item: string) => (
                                            <Badge key={`${title}-${item}`} variant="secondary">{item}</Badge>
                                        ))}
                                    </div>
                                ) : (
                    <p className="text-lg font-bold">{value || 'Not specified'}</p>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={user.photoURL} alt={user.name || 'User'} />
                    <AvatarFallback>{(user.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold">{user.name || 'User'}</h1>
                                    <p className="text-muted-foreground">{user.email}</p>
                                </div>
                <div className="flex gap-2">
                    <Button onClick={handleGoToLanding} variant="outline">
                        Go to Landing
                    </Button>
                    <Button onClick={handleStartOnboarding} variant="default">
                        <Settings className="h-4 w-4 mr-2" />
                        {user.completedOnboarding ? 'Redo Onboarding' : 'Start Onboarding'}
                    </Button>
                </div>
            </div>

                        {user.completedOnboarding ? (
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="responses">Onboarding Responses</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {renderDetailCard("Your Goals", user.goals, <Target className="h-4 w-4 text-muted-foreground" />)}
                                        {renderDetailCard("Experience Level", user.experienceLevel, <BookOpen className="h-4 w-4 text-muted-foreground" />)}
                                        {renderDetailCard("Learning Style", user.learningStyle, <Clock className="h-4 w-4 text-muted-foreground" />)}
                                        {renderDetailCard("Interests", user.interests, <AlertCircle className="h-4 w-4 text-muted-foreground" />)}
                                        {renderDetailCard("Tech Stack", user.techStack, <Briefcase className="h-4 w-4 text-muted-foreground" />)}
                                    </div>
                                </TabsContent>
                                <TabsContent value="responses">
                                    <OnboardingResponses />
                                </TabsContent>
                            </Tabs>
                        ) : (
                <Card className="text-center p-8">
                    <CardHeader>
                        <CardTitle>Onboarding Not Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">You have not completed the onboarding process yet. Your personalized profile information will appear here once you do.</p>
                        <Button onClick={handleStartOnboarding} size="lg">
                            <Settings className="h-4 w-4 mr-2" />
                            Start Onboarding Now
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Contribution Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-40 bg-muted/20 rounded-md">
                        <p className="text-sm text-muted-foreground">Contribution heatmap coming soon!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Lightweight client component inside the page to fetch and render onboarding responses
function OnboardingResponses() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token') || '';
                const res = await fetch('/api/onboarding/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setItems(data.conversations || []);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (!items.length) {
        return <p className="text-sm text-muted-foreground">No onboarding responses yet.</p>;
    }

    return (
        <div className="space-y-4">
            {items.map((c) => (
                <Card key={c._id}>
                    <CardHeader>
                        <CardTitle className="text-sm">{new Date(c.createdAt).toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                                            {(c.conversation || []).map((m: any, idx: number) => (
                                                <div key={`${c._id}-${m.role}-${(m.content || '').slice(0,16)}-${idx}`} className="text-sm">
                                    <span className="font-semibold mr-2">{m.role === 'user' ? 'You' : 'AI'}:</span>
                                    <span className="whitespace-pre-wrap">{m.content}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
