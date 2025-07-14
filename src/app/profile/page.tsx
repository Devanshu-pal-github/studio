
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Target, BookOpen, Clock, AlertCircle, Briefcase, Trophy } from "lucide-react";
import { LearningContext } from '@/lib/vectorStore';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [learningContext, setLearningContext] = useState<LearningContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        if (user) {
            const fetchLearningContext = async () => {
                setLoading(true);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().learningContext) {
                    setLearningContext(docSnap.data().learningContext);
                }
                setLoading(false);
            };

            fetchLearningContext();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
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
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold">{userProfile.name}</h1>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
            </div>

            {learningContext ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {renderDetailCard("Your Goals", learningContext.goals, <Target className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Experience Level", learningContext.experience, <BookOpen className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Learning Style", learningContext.learningStyle, <Clock className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Challenges", learningContext.preferences, <AlertCircle className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Current Projects", learningContext.currentProjects, <Briefcase className="h-4 w-4 text-muted-foreground" />)}
                    {renderDetailCard("Success Looks Like", learningContext.completedTasks, <Trophy className="h-4 w-4 text-muted-foreground" />)}
                </div>
            ) : (
                <Card className="text-center p-8">
                    <CardHeader>
                        <CardTitle>Onboarding Not Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You have not completed the onboarding process yet. Your personalized profile information will appear here once you do.</p>
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
