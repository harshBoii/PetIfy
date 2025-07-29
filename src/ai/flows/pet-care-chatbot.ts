'use server';

/**
 * @fileOverview An AI chatbot for answering questions about pet care.
 *
 * - petCareChatbot - A function that handles the pet care question answering process.
 * - PetCareChatbotInput - The input type for the petCareChatbot function.
 * - PetCareChatbotOutput - The return type for the petCareChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PetCareChatbotInputSchema = z.object({
  question: z.string().describe('The question about pet care.'),
});
export type PetCareChatbotInput = z.infer<typeof PetCareChatbotInputSchema>;

const PetCareChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the pet care question.'),
});
export type PetCareChatbotOutput = z.infer<typeof PetCareChatbotOutputSchema>;

export async function petCareChatbot(input: PetCareChatbotInput): Promise<PetCareChatbotOutput> {
  return petCareChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'petCareChatbotPrompt',
  input: {schema: PetCareChatbotInputSchema},
  output: {schema: PetCareChatbotOutputSchema},
  prompt: `You are a specialized AI chatbot focused exclusively on providing helpful advice about pet care. Your role is to answer questions related to animal health, nutrition, behavior, grooming, and general well-being for common household pets like dogs, cats, birds, and rabbits.

Strictly adhere to the following rules:
1. Only answer questions that are directly related to pet care.
2. If a user asks a question that is NOT about pet care (e.g., about math, history, coding, or any other off-topic subject), you MUST politely decline to answer.
3. When declining, state that your purpose is limited to pet care questions. Do not attempt to answer the off-topic question.

User's Question: {{{question}}}

Your Answer:`,
});

const petCareChatbotFlow = ai.defineFlow(
  {
    name: 'petCareChatbotFlow',
    inputSchema: PetCareChatbotInputSchema,
    outputSchema: PetCareChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
