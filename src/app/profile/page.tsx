
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Target, BookOpen, Clock, AlertCircle, Briefcase, Trophy, Settings } from "lucide-react";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/landing');
            return;
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
    
    const userProfile = {
        name: user.displayName || "User",
        email: user.email || "",
        avatar: user.photoURL || "",
    };
    if (!user) {
        return null;
    }

    const renderDetailCard = (title: string, value: any, icon: React.ReactNode) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {Array.isArray(value) ? (
                     <div className="flex flex-wrap gap-2">
                         {value.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
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
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-4xl font-bold">{user.name}</h1>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {renderDetailCard("Your Goals", user.goals, <Target className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Experience Level", user.experienceLevel, <BookOpen className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Learning Style", user.learningStyle, <Clock className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Interests", user.interests, <AlertCircle className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Tech Stack", user.techStack, <Briefcase className="h-4 w-4 text-muted-foreground" />)}
                </div>
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
