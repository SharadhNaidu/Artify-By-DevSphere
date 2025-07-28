'use server';
/**
 * @fileOverview This file defines a Genkit flow to transform a user-uploaded photo into a selected art style using the Gemini API.
 *
 * - transformPhotoIntoArt - A function that handles the photo transformation process.
 * - TransformPhotoIntoArtInput - The input type for the transformPhotoIntoArt function.
 * - TransformPhotoIntoArtOutput - The return type for the transformPhotoIntoArt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransformPhotoIntoArtInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be transformed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  artStyleDescription: z.string().describe('The description of the desired art style.'),
});
export type TransformPhotoIntoArtInput = z.infer<typeof TransformPhotoIntoArtInputSchema>;

const TransformPhotoIntoArtOutputSchema = z.object({
  transformedPhotoDataUri: z
    .string()
    .describe('The transformed photo as a data URI.'),
});
export type TransformPhotoIntoArtOutput = z.infer<typeof TransformPhotoIntoArtOutputSchema>;

export async function transformPhotoIntoArt(
  input: TransformPhotoIntoArtInput
): Promise<TransformPhotoIntoArtOutput> {
  return transformPhotoIntoArtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transformPhotoIntoArtPrompt',
  input: {schema: TransformPhotoIntoArtInputSchema},
  output: {schema: TransformPhotoIntoArtOutputSchema},
  prompt: `Transform the given photo into the style described.

Art Style: {{{artStyleDescription}}}
Photo: {{media url=photoDataUri}}
`,
});

const transformPhotoIntoArtFlow = ai.defineFlow(
  {
    name: 'transformPhotoIntoArtFlow',
    inputSchema: TransformPhotoIntoArtInputSchema,
    outputSchema: TransformPhotoIntoArtOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      prompt: [
        {text: input.artStyleDescription},
        {media: {url: input.photoDataUri}},
      ],
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {transformedPhotoDataUri: media!.url!};
  }
);
