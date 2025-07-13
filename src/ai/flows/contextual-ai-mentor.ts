// src/ai/flows/contextual-ai-mentor.ts
'use server';

/**
 * @fileOverview A contextual AI mentor that provides help to the user based on the current step they're on.
 *
 * - contextualAiMentor - A function that handles the AI mentor process.
 * - ContextualAiMentorInput - The input type for the contextualAiMentor function.
 * - ContextualAiMentorOutput - The return type for the contextualAiMentor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findYoutubeResources } from './resource-integration';
import { documentationFinder } from './documentation-finder';

const ContextualAiMentorInputSchema = z.object({
  userGoal: z.string().describe('The user\u0027s stated goal, e.g. \"become a full-stack developer\".'),
  userLevel: z.string().describe('The user\u0027s skill level (beginner, intermediate, expert).'),
  projectName: z.string().describe('The name of the project the user is working on.'),
  stepNumber: z.number().describe('The step number the user is currently on.'),
  stepDescription: z.string().describe('The description of the current step.'),
  priorSteps: z.array(z.string()).describe('The descriptions of the steps the user has already completed.'),
  priorQuestions: z.array(z.string()).describe('The questions the user has previously asked.'),
  userQuery: z.string().describe('The user\u0027s current question.'),
});
export type ContextualAiMentorInput = z.infer<typeof ContextualAiMentorInputSchema>;

const ContextualAiMentorOutputSchema = z.object({
  answer: z.string().describe('The AI mentor\u0027s answer to the user\u0027s question.'),
  youtubeLinks: z.array(z.string()).describe('Array of YouTube video links'),
  documentationSnippets: z.array(z.string()).describe('Array of documentation snippets'),
});
export type ContextualAiMentorOutput = z.infer<typeof ContextualAiMentorOutputSchema>;

export async function contextualAiMentor(input: ContextualAiMentorInput): Promise<ContextualAiMentorOutput> {
  return contextualAiMentorFlow(input);
}

const contextualAiMentorPrompt = ai.definePrompt({
  name: 'contextualAiMentorPrompt',
  input: {schema: ContextualAiMentorInputSchema},
  output: {schema: z.object({answer: z.string()})},
  prompt: `You are Compass, a friendly, encouraging, and expert AI mentor for the 'Project Compass' learning platform. Your tone is always supportive. You never say you are an AI. You explain complex topics simply. You are guiding the user through a project.

You are talking to a user. Their stated goal is {{{userGoal}}}. They are a {{{userLevel}}}. They are currently working on the project: {{{projectName}}}. They are on step {{{stepNumber}}}: {{{stepDescription}}}. They have already completed steps: {{#each priorSteps}}{{{this}}}, {{/each}}. They have previously asked about: {{#each priorQuestions}}{{{this}}}, {{/each}}.

{{userQuery}}`,
});

const contextualAiMentorFlow = ai.defineFlow(
  {
    name: 'contextualAiMentorFlow',
    inputSchema: ContextualAiMentorInputSchema,
    outputSchema: ContextualAiMentorOutputSchema,
  },
  async input => {
    const {output} = await contextualAiMentorPrompt(input);

    // Call youtube API
    const youtubeResources = await findYoutubeResources({ query: input.userQuery });

    // Call documentation API
    const documentation = await documentationFinder({
      projectTitle: input.projectName,
      stepDescription: input.stepDescription,
      userQuery: input.userQuery,
    });

    return {
      answer: output!.answer!,
      youtubeLinks: youtubeResources.videoUrls,
      documentationSnippets: documentation.documentationSnippets,
    };
  }
);
