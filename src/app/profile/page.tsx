import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";


const userProfile = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    avatar: "https://placehold.co/100x100.png",
    profile: {
        interest: "Web Development",
        level: "Beginner",
        known_tech: ["HTML", "CSS", "JavaScript"],
    },
    completedProjects: [
        { id: "1", name: "Build a Simple Landing Page" },
        { id: "2", name: "CSS Variables Practice" },
    ]
};

export default function ProfilePage() {
    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-4xl font-bold">{userProfile.name}</h1>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                    <div className="mt-2 flex gap-2">
                        <Badge>{userProfile.profile.level}</Badge>
                        <Badge variant="secondary">{userProfile.profile.interest}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {userProfile.profile.known_tech.map(tech => (
                            <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Accomplishments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {userProfile.completedProjects.length > 0 ? userProfile.completedProjects.map(project => (
                                <li key={project.id} className="flex items-center">
                                    <CheckCircle2 className="h-5 w-5 text-accent mr-3" />
                                    <span>{project.name}</span>
                                </li>
                            )) : <p className="text-sm text-muted-foreground">No completed projects yet.</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="font-headline">Contribution Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your future contribution heatmap will be displayed here!</p>
                     <div className="flex justify-center items-center h-40 bg-muted/50 rounded-md mt-4">
                        <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
