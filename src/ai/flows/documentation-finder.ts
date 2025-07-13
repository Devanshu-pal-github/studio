// src/ai/flows/documentation-finder.ts
'use server';

/**
 * @fileOverview This file defines the documentationFinder flow, which uses AI to find relevant documentation snippets based on the user's current project step.
 *
 * @remarks
 *  - documentationFinder: The main function to find documentation snippets.
 *  - DocumentationFinderInput: The input type for the documentationFinder function.
 *  - DocumentationFinderOutput: The return type for the documentationFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentationFinderInputSchema = z.object({
  projectTitle: z.string().describe('The title of the project the user is working on.'),
  stepDescription: z.string().describe('A description of the current step the user is working on.'),
  userQuery: z.string().describe('The user query related to the current step.'),
});

export type DocumentationFinderInput = z.infer<typeof DocumentationFinderInputSchema>;

const DocumentationFinderOutputSchema = z.object({
  documentationSnippets: z.array(z.string()).describe('An array of documentation snippets relevant to the user query and step.'),
});

export type DocumentationFinderOutput = z.infer<typeof DocumentationFinderOutputSchema>;

export async function documentationFinder(input: DocumentationFinderInput): Promise<DocumentationFinderOutput> {
  return documentationFinderFlow(input);
}

const documentationFinderPrompt = ai.definePrompt({
  name: 'documentationFinderPrompt',
  input: {schema: DocumentationFinderInputSchema},
  output: {schema: DocumentationFinderOutputSchema},
  prompt: `You are an AI documentation expert. You will receive a project title, a description of the current step a user is working on, and a user query.
Your goal is to find relevant documentation snippets that can help the user with their current task. Only include real documentation snippets in your response, not conversational text.

Project Title: {{{projectTitle}}}
Step Description: {{{stepDescription}}}
User Query: {{{userQuery}}}

Here are some relevant documentation snippets:
`,
});

const documentationFinderFlow = ai.defineFlow(
  {
    name: 'documentationFinderFlow',
    inputSchema: DocumentationFinderInputSchema,
    outputSchema: DocumentationFinderOutputSchema,
  },
  async input => {
    const {output} = await documentationFinderPrompt(input);
    return output!;
  }
);
