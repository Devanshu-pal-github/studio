


import { defineFlow, run } from '@genkit-ai/flow';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the input schema: the user's raw onboarding conversation
export const DashboardInputSchema = z.object({
  onboardingHistory: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
});

// Define the structured output we want from the AI
const ProjectRecommendationSchema = z.object({
  title: z.string().describe("A catchy, specific title for the project."),
  description: z.string().describe("A 1-2 sentence description of what the project is and what the user will learn."),
  tags: z.array(z.string()).describe("A list of 2-3 relevant technology or skill tags (e.g., 'React', 'Firebase', 'CSS')."),
});

const DashboardOutputSchema = z.object({
  profileSummary: z.string().describe("A 2-3 sentence summary of the user's skills, goals, and learning style, written in a friendly and encouraging tone."),
  projectRecommendations: z.array(ProjectRecommendationSchema).describe("A list of 3-5 project recommendations tailored to the user's profile."),
});

// Define the Dashboard Personalization Flow
export const dashboardPersonalizationFlow = defineFlow(
  {
    name: 'dashboardPersonalizationFlow',
    inputSchema: DashboardInputSchema,
    outputSchema: DashboardOutputSchema,
  },
  async ({ onboardingHistory }) => {
    
    const historyAsString = onboardingHistory.map(m => `${m.role}: ${m.content}`).join('
');

    const systemPrompt = `You are a helpful AI assistant for a learning platform called Project Compass. Your task is to analyze a user's onboarding conversation and generate a personalized dashboard for them.

    Based on the provided conversation history, you will:
    1.  Create a concise, encouraging summary of the user's profile.
    2.  Generate 3-5 specific and actionable project ideas that are highly relevant to their stated goals and skills. The projects should be interesting and just challenging enough to help them grow.
    
    You must provide your response in the requested JSON format.`;

    const llmResponse = await run("generate-dashboard-content", () =>
      gemini15Flash.generate({
        prompt: `System Prompt: ${systemPrompt}

Onboarding Conversation:
${historyAsString}`,
        output: {
          schema: DashboardOutputSchema,
        },
        config: {
          temperature: 0.7,
        },
      })
    );

    return llmResponse.output()!;
  }
);
