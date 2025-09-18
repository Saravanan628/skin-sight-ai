
'use server';
/**
 * @fileOverview An AI flow for generating images from a text prompt.
 *
 * - generateImage - Generates an image based on a text description.
 * - ImageGenerationInput - The input type for the generateImage function.
 * - ImageGenerationOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ImageGenerationInputSchema = z.object({
  prompts: z.array(z.string()).describe('The text prompts to generate images from.'),
});
export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;

const ImageGenerationOutputSchema = z.object({
  imageUrls: z
    .array(z.string().nullable())
    .describe('The data URIs of the generated images. Can be null if generation fails.'),
});
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;

export async function generateImages(
  input: ImageGenerationInput
): Promise<ImageGenerationOutput> {
  return imageGenerationFlow(input);
}

const imageGenerationFlow = ai.defineFlow(
  {
    name: 'imageGenerationFlow',
    inputSchema: ImageGenerationInputSchema,
    outputSchema: ImageGenerationOutputSchema,
  },
  async (input) => {
    const imagePromises = input.prompts.map(async (prompt) => {
      try {
        const result = await ai.generate({
          model: 'googleai/gemini-1.5-flash-latest',
          prompt: `Generate a clear, simple, high-quality illustration of a person performing the following yoga pose: ${prompt}. The style should be minimalist, on a plain, solid light-colored background, suitable for a health and wellness app tutorial.`,
        });
        return result.media?.url ?? null;
      } catch (error) {
        console.error(`Image generation failed for prompt: "${prompt}"`, error);
        return null;
      }
    });

    const imageUrls = await Promise.all(imagePromises);

    return { imageUrls };
  }
);
