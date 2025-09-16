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
  await new Promise((resolve) => setTimeout(resolve, 2500));

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

export async function getExplanation(
  diseaseName: string
): Promise<ExplainIdentifiedDiseaseOutput> {
  try {
    const result = await explainIdentifiedDisease({ diseaseName });
    return result;
  } catch (error) {
    console.error('Error getting explanation:', error);
    return { explanation: 'Could not retrieve an explanation at this time.' };
  }
}

export async function getNaturalCures(
  diseaseName: string
): Promise<SuggestNaturalCuresOutput> {
  try {
    const result = await suggestNaturalCures({ diseaseName });
    return result;
  } catch (error) {
    console.error('Error getting natural cures:', error);
    return {
      naturalCures: ['Could not retrieve natural cures at this time.'],
    };
  }
}
