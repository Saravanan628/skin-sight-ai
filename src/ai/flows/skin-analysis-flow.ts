
'use server';
/**
 * @fileOverview A skin condition analysis AI agent.
 *
 * - analyzeSkin - A function that handles the skin condition analysis process.
 * - SkinAnalysisInput - The input type for the analyzeSkin function.
 * - SkinAnalysisOutput - The return type for the analyzeSkin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SkinAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a skin condition, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SkinAnalysisInput = z.infer<typeof SkinAnalysisInputSchema>;

export const SkinAnalysisOutputSchema = z.object({
  condition: z.string().describe('The name of the identified skin condition.'),
  explanation: z
    .string()
    .describe('A brief explanation of what the condition is.'),
  severity: z
    .enum(['Mild', 'Moderate', 'Severe'])
    .describe('The estimated severity of the condition.'),
  stage: z
    .string()
    .describe('The estimated stage of the condition (e.g., Early, Acute, Chronic).'),
  possibleCauses: z.array(z.string()).describe('A list of possible causes for the skin condition.'),
  vitaminDeficiencies: z.array(z.string()).describe('A list of vitamin deficiencies that could be related to the condition.'),
  naturalRemedies: z.array(z.string()).describe('A list of natural remedial measures for the condition.'),
});
export type SkinAnalysisOutput = z.infer<typeof SkinAnalysisOutputSchema>;

export async function analyzeSkin(input: SkinAnalysisInput): Promise<SkinAnalysisOutput> {
  return skinAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skinAnalysisPrompt',
  input: {schema: SkinAnalysisInputSchema},
  output: {schema: SkinAnalysisOutputSchema},
  prompt: `You are an expert dermatologist. Your task is to analyze the provided image of a skin condition and provide a diagnosis.

Based on the image, identify the most likely skin condition, provide a brief explanation of what it is, estimate its severity (Mild, Moderate, or Severe), determine its current stage (e.g., Early, Acute, Chronic), list common possible causes, identify potential vitamin deficiencies related to it, and suggest natural remedial measures.

Present your analysis in the structured format requested.

Image: {{media url=photoDataUri}}`,
});

const skinAnalysisFlow = ai.defineFlow(
  {
    name: 'skinAnalysisFlow',
    inputSchema: SkinAnalysisInputSchema,
    outputSchema: SkinAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
