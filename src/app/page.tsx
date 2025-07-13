import { ProjectCard } from '@/components/ProjectCard';
import { getProjects } from '@/lib/data';

export default async function Dashboard() {
  const projects = await getProjects();

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">Your Learning Trail</h1>
      <p className="text-muted-foreground mb-8">Recommended projects based on your interests and skill level.</p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
