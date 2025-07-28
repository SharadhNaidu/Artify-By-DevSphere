'use server';

/**
 * @fileOverview An AI agent to generate a low-resolution preview of a photo transformed into a selected art style.
 *
 * - generateArtPreview - A function that handles the art style preview generation process.
 * - GenerateArtPreviewInput - The input type for the generateArtPreview function.
 * - GenerateArtPreviewOutput - The return type for the generateArtPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArtPreviewInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  artStyleDescription: z.string().describe('The description of the art style to apply.'),
});
export type GenerateArtPreviewInput = z.infer<typeof GenerateArtPreviewInputSchema>;

const GenerateArtPreviewOutputSchema = z.object({
  previewDataUri: z.string().describe('The data URI of the generated preview image.'),
});
export type GenerateArtPreviewOutput = z.infer<typeof GenerateArtPreviewOutputSchema>;

export async function generateArtPreview(input: GenerateArtPreviewInput): Promise<GenerateArtPreviewOutput> {
  return generateArtPreviewFlow(input);
}

const generateArtPreviewFlow = ai.defineFlow(
  {
    name: 'generateArtPreviewFlow',
    inputSchema: GenerateArtPreviewInputSchema,
    outputSchema: GenerateArtPreviewOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: [
        {text: `Low resolution preview of: ${input.artStyleDescription}`},
        {media: {url: input.photoDataUri}},
      ],
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {previewDataUri: media!.url!};
  }
);
