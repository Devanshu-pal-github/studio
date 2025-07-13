// src/ai/flows/resource-integration.ts
'use server';

/**
 * @fileOverview Integrates YouTube video tutorials for a given query.
 *
 * - findYoutubeResources - A function that returns relevant YouTube video URLs.
 * - FindYoutubeResourcesInput - The input type for the findYoutubeResources function.
 * - FindYoutubeResourcesOutput - The return type for the findYoutubeResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindYoutubeResourcesInputSchema = z.object({
  query: z.string().describe('The search query for YouTube videos.'),
});
export type FindYoutubeResourcesInput = z.infer<typeof FindYoutubeResourcesInputSchema>;

const FindYoutubeResourcesOutputSchema = z.object({
  videoUrls: z.array(z.string()).describe('An array of YouTube video URLs relevant to the query.'),
});
export type FindYoutubeResourcesOutput = z.infer<typeof FindYoutubeResourcesOutputSchema>;

export async function findYoutubeResources(input: FindYoutubeResourcesInput): Promise<FindYoutubeResourcesOutput> {
  return findYoutubeResourcesFlow(input);
}

const findYoutubeResourcesPrompt = ai.definePrompt({
  name: 'findYoutubeResourcesPrompt',
  input: {schema: FindYoutubeResourcesInputSchema},
  output: {schema: FindYoutubeResourcesOutputSchema},
  prompt: `You are an expert in finding helpful YouTube video tutorials for developers.

  Given the following search query, find a list of YouTube video URLs that would be helpful for a developer.

  Query: {{{query}}}

  Return only the video URLs in the videoUrls array. Do not include any other text.`,
});

const findYoutubeResourcesFlow = ai.defineFlow(
  {
    name: 'findYoutubeResourcesFlow',
    inputSchema: FindYoutubeResourcesInputSchema,
    outputSchema: FindYoutubeResourcesOutputSchema,
  },
  async input => {
    const {output} = await findYoutubeResourcesPrompt(input);
    return output!;
  }
);

