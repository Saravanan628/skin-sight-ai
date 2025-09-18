
'use server';
/**
 * @fileOverview An AI flow for analyzing skincare ingredients.
 *
 * - analyzeIngredients - Analyzes an image of an ingredient list for a given skin condition.
 * - IngredientAnalysisInput - The input type for the analyzeIngredients function.
 * - IngredientAnalysisOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const IngredientAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a skincare product's ingredient list, as a data URI."
    ),
  skinCondition: z
    .string()
    .describe('The diagnosed skin condition to check ingredients against (e.g., "Eczema").'),
});
export type IngredientAnalysisInput = z.infer<typeof IngredientAnalysisInputSchema>;

const IngredientAnalysisOutputSchema = z.object({
    beneficialIngredients: z.array(z.string()).describe("A list of ingredients from the image that are likely beneficial for the user's skin condition."),
    harmfulIngredients: z.array(z.string()).describe("A list of ingredients from the image that could be potentially irritating or harmful for the user's skin condition."),
    summary: z.string().describe("A brief, overall summary of whether the product is suitable for the user's skin condition and why.")
});
export type IngredientAnalysisOutput = z.infer<typeof IngredientAnalysisOutputSchema>;


export async function analyzeIngredients(input: IngredientAnalysisInput): Promise<IngredientAnalysisOutput> {
  return ingredientAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientAnalysisPrompt',
  input: {schema: IngredientAnalysisInputSchema},
  output: {schema: IngredientAnalysisOutputSchema},
  prompt: `You are an expert cosmetic chemist and dermatologist. Your task is to analyze an image of a skincare product's ingredient list for a user with a specific skin condition.

First, use OCR to accurately read all ingredients from the provided image.

Then, based on the user's diagnosed condition of **{{{skinCondition}}}**, categorize the ingredients into two lists:
1.  **Beneficial Ingredients:** Ingredients that are known to be helpful, soothing, or therapeutic for {{{skinCondition}}}.
2.  **Harmful Ingredients:** Common irritants, allergens, or ingredients that could potentially worsen {{{skinCondition}}}.

Finally, provide a concise summary explaining whether the product seems suitable for someone with {{{skinCondition}}} and why. Keep the tone helpful and informative.

**Image of Ingredient List:**
{{media url=photoDataUri}}`,
});

const ingredientAnalysisFlow = ai.defineFlow(
  {
    name: 'ingredientAnalysisFlow',
    inputSchema: IngredientAnalysisInputSchema,
    outputSchema: IngredientAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
