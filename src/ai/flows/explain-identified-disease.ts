'use server';

/**
 * @fileOverview Explains the identified skin disease, including possible causes, severity, and stage.
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
  diseaseName: z.string().describe('The name of the identified skin disease.'),
  severity: z
    .string()
    .describe('The severity of the disease (e.g., Mild, Moderate, Severe).'),
  stage: z
    .string()
    .describe('The current stage of the disease (e.g., Early, Active, Chronic).'),
  explanation: z
    .string()
    .describe('A detailed explanation of the skin disease.'),
  possibleCauses: z
    .array(z.string())
    .describe('A list of possible causes for the skin disease.'),
  vitaminDeficiency: z
    .string()
    .describe(
      'Explanation of potential vitamin deficiencies related to the disease.'
    ),
});
export type ExplainIdentifiedDiseaseOutput = z.infer<typeof ExplainIdentifiedDiseaseOutputSchema>;

export async function explainIdentifiedDisease(input: ExplainIdentifiedDiseaseInput): Promise<ExplainIdentifiedDiseaseOutput> {
  return explainIdentifiedDiseaseFlow(input);
}

const explainIdentifiedDiseasePrompt = ai.definePrompt({
  name: 'explainIdentifiedDiseasePrompt',
  input: {schema: ExplainIdentifiedDiseaseInputSchema},
  output: {schema: ExplainIdentifiedDiseaseOutputSchema},
  prompt: `You are a medical expert specializing in dermatology. For the skin disease "{{diseaseName}}", provide the following information.
  - A random but plausible severity (Mild, Moderate, or Severe).
  - A random but plausible stage (Early, Active, or Chronic).
  - A detailed explanation of the disease.
  - A list of at least 3 possible causes.
  - An explanation of potential vitamin deficiencies that could be related to this condition.`,
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
