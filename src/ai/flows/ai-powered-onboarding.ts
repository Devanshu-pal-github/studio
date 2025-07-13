import { defineFlow, run } from '@genkit-ai/flow';
import { gemini15Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

const OnboardingHistorySchema = z.object({
  history: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })),
});

export const onboardingFlow = defineFlow(
  {
    name: 'onboardingFlow',
    inputSchema: OnboardingHistorySchema,
    outputSchema: z.string(),
  },
  async ({ history }) => {
    const systemPrompt = `You are an expert career and learning mentor for a platform called Project Compass. Your goal is to understand the user's skills, goals, and learning style to create a personalized project roadmap for them.
    
    Your tone should be friendly, encouraging, and insightful.
    
    RULES:
    - Ask only ONE question at a time.
    - Start with a broad question, then get more specific based on their answers.
    - Keep your questions concise.
    - Your goal is to understand their current skills, what they want to learn, their career ambitions, and how they like to learn (e.g., videos, projects, docs).
    - After 4-5 questions, if you feel you have enough information to build a profile, end your response with the exact token "[DONE]". Do not say anything after the token.`;

    const historyString = history.map(m => `${m.role}: ${m.content}`).join('\n'); // Fixed join syntax
    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${historyString}\n\nmodel:`;

    const llmResponse = await run("generate-question", () =>
      gemini15Flash.generate({
        prompt: fullPrompt,
        config: {
          temperature: 0.8,
        },
      })
    );

    return llmResponse.text();
  }
);