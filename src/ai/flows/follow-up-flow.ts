
'use server';
/**
 * @fileOverview A flow for answering follow-up questions based on a skin analysis.
 *
 * - askFollowUp - A function that handles the follow-up question process.
 * - FollowUpInput - The input type for the askFollowUp function.
 * - FollowUpOutput - The return type for the askFollowUp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { SkinAnalysisOutput } from './skin-analysis-flow';

const SkinAnalysisOutputSchemaForPrompt = z.object({
  condition: z.string(),
  explanation: z.string(),
  severity: z.enum(['Mild', 'Moderate', 'Severe']),
  stage: z.string(),
  possibleCauses: z.array(z.string()),
  vitaminDeficiencies: z.array(z.string()),
  naturalRemedies: z.array(z.string()),
});

const FollowUpInputSchema = z.object({
  analysis: SkinAnalysisOutputSchemaForPrompt.describe("The original skin analysis object."),
  question: z.string().describe("The user's follow-up question."),
  chatHistory: z.string().optional().describe("The history of the conversation so far."),
});
export type FollowUpInput = {
    analysis: SkinAnalysisOutput;
    question: string;
    chatHistory?: string;
};


const FollowUpOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the follow-up question."),
});
export type FollowUpOutput = z.infer<typeof FollowUpOutputSchema>;


export async function askFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
  const result = await followUpFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'followUpPrompt',
  input: {
    schema: FollowUpInputSchema
  },
  output: {schema: FollowUpOutputSchema},
  prompt: `You are an expert dermatologist providing a follow-up consultation via chat.

You have already provided an initial analysis for a skin condition. The user now has a follow-up question.

Your task is to answer the user's question based on the context of the original analysis and the conversation history. Be helpful, empathetic, and provide clear, concise answers. Do not repeat information from the original analysis unless it's necessary to answer the question. Keep your answers conversational.

**Important:** You are an AI assistant. You are not a doctor. Always include a disclaimer that the user should consult a real medical professional.

**Original Analysis:**
- Condition: {{{analysis.condition}}}
- Explanation: {{{analysis.explanation}}}
- Severity: {{{analysis.severity}}}
- Stage: {{{analysis.stage}}}
- Possible Causes: {{{analysis.possibleCauses}}}
- Vitamin Deficiencies: {{{analysis.vitaminDeficiencies}}}
- Natural Remedies: {{{analysis.naturalRemedies}}}

**Conversation History:**
{{{chatHistory}}}

**User's New Question:**
{{{question}}}

Provide your answer now.`,
});

const followUpFlow = ai.defineFlow(
  {
    name: 'followUpFlow',
    inputSchema: FollowUpInputSchema,
    outputSchema: FollowUpOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
