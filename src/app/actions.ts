'use server';

import {
  explainIdentifiedDisease,
  ExplainIdentifiedDiseaseOutput,
} from '@/ai/flows/explain-identified-disease';
import {
  suggestNaturalCures,
  SuggestNaturalCuresOutput,
} from '@/ai/flows/suggest-natural-cures';

const possibleDiseases = ['eczema', 'psoriasis', 'acne'];

// This is a mock function to simulate disease identification from an image.
// In a real application, this would call a machine learning model.
export async function identifyDisease(
  imageData: string
): Promise<{ disease: string }> {
  // Simulate network delay and processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real app, you would process the imageData and send it to your model.
  // Here, we just pick a random disease for demonstration purposes.
  const randomIndex = Math.floor(Math.random() * possibleDiseases.length);
  const identifiedDisease = possibleDiseases[randomIndex];

  if (!imageData) {
    // to avoid unused variable error during compilation
    console.log("No image data received, but that's okay for this mock.");
  }

  return { disease: identifiedDisease };
}

export async function getFullAnalysis(
  diseaseName: string
): Promise<{
  explanation: ExplainIdentifiedDiseaseOutput;
  cures: SuggestNaturalCuresOutput;
}> {
  try {
    const [explanation, cures] = await Promise.all([
      explainIdentifiedDisease({ diseaseName }),
      suggestNaturalCures({ diseaseName }),
    ]);
    return { explanation, cures };
  } catch (error) {
    console.error('Error getting full analysis:', error);
    throw new Error('Could not retrieve the full analysis.');
  }
}
