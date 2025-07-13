import type { Project } from '@/lib/data';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const difficultyVariant = {
        'Beginner': 'secondary',
        'Intermediate': 'default',
        'Advanced': 'destructive'
    } as const;
    
    return (
        <Link href={project.href} className="group block h-full">
            <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 border-2 border-transparent group-hover:border-primary">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                            <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Badge variant={difficultyVariant[project.difficulty]}>{project.difficulty}</Badge>
                    <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Start Project <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
