
'use server';
/**
 * @fileOverview An AI flow for recommending skincare products.
 *
 * - recommendProducts - Recommends products based on a skin condition and user query.
 * - ProductRecommendationInput - The input type for the recommendProducts function.
 * - ProductRecommendationOutput - The return type for the recommendProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ProductRecommendationInputSchema = z.object({
  skinCondition: z
    .string()
    .describe('The diagnosed skin condition (e.g., "Eczema").'),
  productDescription: z
    .string()
    .describe('A user\'s description of the product they are looking for (e.g., "a gentle daily moisturizer").'),
});
export type ProductRecommendationInput = z.infer<typeof ProductRecommendationInputSchema>;

const ProductRecommendationOutputSchema = z.object({
    recommendations: z.array(z.object({
        productName: z.string().describe("The full, real-world brand and name of the recommended product."),
        reason: z.string().describe("A brief, one-sentence explanation of why this product is a good recommendation for the user's condition and needs."),
        purchaseLink: z.string().url().describe("A direct purchase link for the product on a major online retailer like Amazon, Sephora, Target, or the brand's official website.")
    })).describe("A list of 3-5 skincare product recommendations.")
});
export type ProductRecommendationOutput = z.infer<typeof ProductRecommendationOutputSchema>;


export async function recommendProducts(input: ProductRecommendationInput): Promise<ProductRecommendationOutput> {
  return productRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationPrompt',
  input: {schema: ProductRecommendationInputSchema},
  output: {schema: ProductRecommendationOutputSchema},
  prompt: `You are an expert skincare advisor and personal shopper. A user needs help finding a product that is suitable for their diagnosed skin condition.

Your task is to recommend 3-5 real, commercially available skincare products based on the user's needs.

For each product, you must provide:
1. Its full brand and name.
2. A brief, one-sentence reason why it's a good choice.
3. A direct, working purchase link from a major online retailer (like Amazon, Sephora, Target, or the brand's official website).

User's Diagnosed Skin Condition: {{{skinCondition}}}
User's Request: "I am looking for... {{{productDescription}}}"

Provide your recommendations now.`,
});

const productRecommendationFlow = ai.defineFlow(
  {
    name: 'productRecommendationFlow',
    inputSchema: ProductRecommendationInputSchema,
    outputSchema: ProductRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
