'use server';

/**
 * @fileOverview Explains the identified skin disease, including possible causes.
 *
 * - explainIdentifiedDisease - A function that handles explaining the identified skin disease.
 * - ExplainIdentifiedDiseaseInput - The input type for the explainIdentifiedDisease function.
 * - ExplainIdentifiedDiseaseOutput - The return type for the explainIdentifiedDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainIdentifiedDiseaseInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified skin disease.'),
});
export type ExplainIdentifiedDiseaseInput = z.infer<typeof ExplainIdentifiedDiseaseInputSchema>;

const ExplainIdentifiedDiseaseOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the skin disease, including possible causes.'),
});
export type ExplainIdentifiedDiseaseOutput = z.infer<typeof ExplainIdentifiedDiseaseOutputSchema>;

export async function explainIdentifiedDisease(input: ExplainIdentifiedDiseaseInput): Promise<ExplainIdentifiedDiseaseOutput> {
  return explainIdentifiedDiseaseFlow(input);
}

const explainIdentifiedDiseasePrompt = ai.definePrompt({
  name: 'explainIdentifiedDiseasePrompt',
  input: {schema: ExplainIdentifiedDiseaseInputSchema},
  output: {schema: ExplainIdentifiedDiseaseOutputSchema},
  prompt: `You are a medical expert specializing in dermatology. Provide a detailed explanation of the skin disease: {{diseaseName}}, including possible causes.`,
});

const explainIdentifiedDiseaseFlow = ai.defineFlow(
  {
    name: 'explainIdentifiedDiseaseFlow',
    inputSchema: ExplainIdentifiedDiseaseInputSchema,
    outputSchema: ExplainIdentifiedDiseaseOutputSchema,
  },
  async input => {
    const {output} = await explainIdentifiedDiseasePrompt(input);
    return output!;
  }
);
