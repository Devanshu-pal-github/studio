import { getProjectById } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';
import { Badge } from '@/components/ui/badge';

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const project = await getProjectById(params.id);

    if (!project) {
        notFound();
    }

    return (
        <div className="mx-auto w-full">
            <div className="mb-8">
                <Badge variant={project.difficulty === 'Beginner' ? 'secondary' : project.difficulty === 'Intermediate' ? 'default' : 'destructive'} className="mb-2">
                    {project.difficulty}
                </Badge>
                <h1 className="font-headline text-4xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground mt-2 text-lg">{project.description}</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                </div>
            </div>

            <ProjectDetailClient project={project} />
        </div>
    );
}
