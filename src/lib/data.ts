export interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    href: string;
}

const projects: Project[] = [
    {
        id: 'personal-portfolio-website',
        title: 'Personal Portfolio Website',
        description: 'Build a stunning personal portfolio to showcase your skills and projects to potential employers.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        difficulty: 'Beginner',
        href: '/project/personal-portfolio-website'
    },
    {
        id: 'interactive-quiz-app',
        title: 'Interactive Quiz App',
        description: 'Create a fun, interactive quiz application on any topic of your choice.',
        techStack: ['React', 'TypeScript', 'CSS'],
        difficulty: 'Beginner',
        href: '/project/interactive-quiz-app'
    },
    {
        id: 'real-time-chat-application',
        title: 'Real-time Chat Application',
        description: 'Develop a real-time chat app where users can communicate instantly.',
        techStack: ['React', 'Firebase', 'Tailwind CSS'],
        difficulty: 'Intermediate',
        href: '/project/real-time-chat-application'
    },
    {
        id: 'e-commerce-storefront',
        title: 'E-commerce Storefront',
        description: 'Build the front-end for an e-commerce platform with product listings and a shopping cart.',
        techStack: ['Next.js', 'Stripe', 'Tailwind CSS'],
        difficulty: 'Intermediate',
        href: '/project/e-commerce-storefront'
    },
    {
        id: 'ai-powered-blog-generator',
        title: 'AI-Powered Blog Generator',
        description: 'Use a generative AI API to create a tool that writes blog posts on given topics.',
        techStack: ['Next.js', 'Gemini API', 'shadcn/ui'],
        difficulty: 'Advanced',
        href: '/project/ai-powered-blog-generator'
    },
    {
        id: 'weather-dashboard',
        title: 'Weather Dashboard',
        description: 'A dashboard that displays current weather and forecasts for searched locations using a third-party API.',
        techStack: ['JavaScript', 'HTML', 'CSS', 'OpenWeather API'],
        difficulty: 'Beginner',
        href: '/project/weather-dashboard'
    }
];

export async function getProjects(): Promise<Project[]> {
    // In a real app, this would fetch from Firestore.
    // For the MVP, we return mock data.
    return new Promise(resolve => setTimeout(() => resolve(projects), 200));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    return new Promise(resolve => setTimeout(() => resolve(projects.find(p => p.id === id)), 200));
}
