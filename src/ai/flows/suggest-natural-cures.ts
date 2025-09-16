'use server';

/**
 * @fileOverview Suggests natural methods and foods for managing a identified skin condition.
 *
 * - suggestNaturalCures - A function that suggests natural methods and foods for managing a skin condition.
 * - SuggestNaturalCuresInput - The input type for the suggestNaturalCures function.
 * - SuggestNaturalCuresOutput - The return type for the suggestNaturalCures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNaturalCuresInputSchema = z.object({
  diseaseName: z.string().describe('The name of the identified skin disease.'),
});
export type SuggestNaturalCuresInput = z.infer<typeof SuggestNaturalCuresInputSchema>;

const SuggestNaturalCuresOutputSchema = z.object({
  naturalRemedies: z
    .array(z.string())
    .describe('A list of natural remedies for managing the identified skin disease.'),
  recommendedFoods: z
    .array(z.string())
    .describe('A list of recommended foods to consume for the cure.'),
});
export type SuggestNaturalCuresOutput = z.infer<typeof SuggestNaturalCuresOutputSchema>;

export async function suggestNaturalCures(input: SuggestNaturalCuresInput): Promise<SuggestNaturalCuresOutput> {
  return suggestNaturalCuresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNaturalCuresPrompt',
  input: {schema: SuggestNaturalCuresInputSchema},
  output: {schema: SuggestNaturalCuresOutputSchema},
  prompt: `You are a nutritionist and a specialist in natural medicine. For the skin disease "{{diseaseName}}", provide a list of natural remedies and a list of recommended foods to help manage the condition.`,
});

const suggestNaturalCuresFlow = ai.defineFlow(
  {
    name: 'suggestNaturalCuresFlow',
    inputSchema: SuggestNaturalCuresInputSchema,
    outputSchema: SuggestNaturalCuresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
