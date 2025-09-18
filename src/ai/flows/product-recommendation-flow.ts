
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

// Mock tool - in a real app, this would call a shopping API.
const searchShoppingTool = ai.defineTool(
    {
        name: 'searchShopping',
        description: 'Searches an online shopping database for skincare products that match a query and are suitable for a specific skin condition.',
        inputSchema: z.object({
            query: z.string().describe('The search query for the product (e.g., "gentle daily moisturizer").'),
            skinCondition: z.string().describe('The skin condition to filter for (e.g., "Eczema").')
        }),
        outputSchema: ProductRecommendationOutputSchema,
    },
    async (input) => {
        // This is a simplified mock. The LLM will actually generate the content.
        // In a real implementation, you might call an external API here.
        // For this example, we'll just let the model hallucinate valid-looking data.
        console.log(`Simulating shopping search for: ${input.query} for ${input.skinCondition}`);
        return { recommendations: [] }; // The model will fill this in.
    }
);


const prompt = ai.definePrompt({
  name: 'productRecommendationPrompt',
  input: {schema: ProductRecommendationInputSchema},
  output: {schema: ProductRecommendationOutputSchema},
  tools: [searchShoppingTool],
  prompt: `You are an expert skincare advisor and personal shopper. A user needs help finding a product that is suitable for their diagnosed skin condition.

Your task is to recommend 3-5 real, commercially available skincare products based on the user's needs.

First, use the searchShopping tool to find products that match the user's request.

Then, for each product returned by the tool, you must provide:
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
