'use server';

/**
 * @fileOverview Implements the AI-powered onboarding flow to gather user interests and skill level.
 *
 * - aiPoweredOnboarding - A function that initiates the AI onboarding process.
 * - AiPoweredOnboardingInput - The input type for the aiPoweredOnboarding function (currently empty).
 * - AiPoweredOnboardingOutput - The return type for the aiPoweredOnboarding function, containing the chatbot's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredOnboardingInputSchema = z.object({
  userMessage: z.string().describe('The user message to the chatbot.'),
});
export type AiPoweredOnboardingInput = z.infer<typeof AiPoweredOnboardingInputSchema>;

const AiPoweredOnboardingOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response to the user message.'),
});
export type AiPoweredOnboardingOutput = z.infer<typeof AiPoweredOnboardingOutputSchema>;

export async function aiPoweredOnboarding(input: AiPoweredOnboardingInput): Promise<AiPoweredOnboardingOutput> {
  return aiPoweredOnboardingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredOnboardingPrompt',
  input: {schema: AiPoweredOnboardingInputSchema},
  output: {schema: AiPoweredOnboardingOutputSchema},
  prompt: `You are Compass, a friendly, encouraging, and expert AI mentor for the 'Project Compass' learning platform. Your tone is always supportive and encouraging.\n
You are having a conversation with a new user to determine their interests and skill level so that the platform can recommend personalized projects.\n
Previous conversation:\n
{{userMessage}}\n
What is your next question to the user?  Make sure your questions are open ended.\n`,
});

const aiPoweredOnboardingFlow = ai.defineFlow(
  {
    name: 'aiPoweredOnboardingFlow',
    inputSchema: AiPoweredOnboardingInputSchema,
    outputSchema: AiPoweredOnboardingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {chatbotResponse: output!.chatbotResponse!};
  }
);
