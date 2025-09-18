
'use server';
/**
 * @fileOverview An AI flow for recommending yoga poses for skin conditions.
 *
 * - recommendYoga - Recommends yoga poses based on a skin condition.
 * - YogaRecommendationInput - The input type for the recommendYoga function.
 * - YogaRecommendationOutput - The return type for the recommendYoga function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const YogaRecommendationInputSchema = z.object({
  skinCondition: z
    .string()
    .describe('The diagnosed skin condition (e.g., "Eczema").'),
});
export type YogaRecommendationInput = z.infer<typeof YogaRecommendationInputSchema>;

const YogaRecommendationOutputSchema = z.object({
    recommendations: z.array(z.object({
        poseName: z.string().describe("The name of the yoga pose (asana)."),
        description: z.string().describe("A brief, clear description of how to perform the pose."),
        benefits: z.string().describe("An explanation of how this specific pose benefits the skin or helps with the condition, focusing on aspects like blood circulation, stress reduction, and detoxification."),
    })).describe("A list of 3-5 yoga poses beneficial for the user's skin condition.")
});
export type YogaRecommendationOutput = z.infer<typeof YogaRecommendationOutputSchema>;


export async function recommendYoga(input: YogaRecommendationInput): Promise<YogaRecommendationOutput> {
  return yogaRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yogaRecommendationPrompt',
  input: {schema: YogaRecommendationInputSchema},
  output: {schema: YogaRecommendationOutputSchema},
  prompt: `You are an expert yoga instructor and dermatologist. A user needs yoga poses that can help alleviate symptoms and improve their diagnosed skin condition.

Your task is to recommend 3-5 yoga asanas suitable for the user's condition.

For each pose, you must provide:
1. The name of the pose.
2. A clear, step-by-step description of how to perform it.
3. The specific benefits of the pose for skin health and for the user's condition, such as improving blood circulation, reducing stress, or aiding in detoxification.

User's Diagnosed Skin Condition: {{{skinCondition}}}

Provide your recommendations now.`,
});

const yogaRecommendationFlow = ai.defineFlow(
  {
    name: 'yogaRecommendationFlow',
    inputSchema: YogaRecommendationInputSchema,
    outputSchema: YogaRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
