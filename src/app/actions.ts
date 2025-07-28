"use server";

import { generateArtPreview, transformPhotoIntoArt } from "@/ai/flows";
import { artStyles } from "@/lib/constants";
import fs from "fs/promises";
import path from "path";

interface ActionResult<T> {
  error?: string;
  data?: T;
}

const collageDataPath = path.join(process.cwd(), 'src', 'lib', 'collage-data.json');

async function readCollageData() {
  try {
    const data = await fs.readFile(collageDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Error reading collage data:", error);
    return [];
  }
}

async function writeCollageData(data: any) {
  try {
    await fs.writeFile(collageDataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing collage data:", error);
  }
}

export async function generatePreviewAction(input: {
  photoDataUri: string;
  artStyleDescription: string;
}): Promise<{error?: string; previewDataUri?: string}> {
  try {
    const result = await generateArtPreview(input);
    return { previewDataUri: result.previewDataUri };
  } catch (e: any) {
    console.error("Error in generatePreviewAction:", e);
    return { error: e.message || "An unexpected error occurred during preview generation." };
  }
}

export async function transformPhotoAction(input: {
  photoDataUri: string;
  artStyleDescription: string;
}): Promise<{error?: string; transformedPhotoDataUri?: string}> {
  try {
    const result = await transformPhotoIntoArt(input);
    return { transformedPhotoDataUri: result.transformedPhotoDataUri };
  } catch (e: any) {
    console.error("Error in transformPhotoAction:", e);
    return { error: e.message || "An unexpected error occurred during art transformation." };
  }
}


export async function saveToCollageAction(input: {
  imageDataUri: string;
  styleId: string;
}): Promise<{error?: string; success?: boolean}> {
  try {
    const style = artStyles.find(s => s.id === input.styleId);
    if (!style) {
      return { error: "Invalid art style." };
    }

    const collageData = await readCollageData();
    
    collageData.unshift({
      id: new Date().getTime(),
      imageDataUri: input.imageDataUri,
      styleName: style.name,
    });
    
    // Keep only the latest 20 images
    const slicedData = collageData.slice(0, 50);

    await writeCollageData(slicedData);

    return { success: true };
  } catch (e: any) {
    console.error("Error in saveToCollageAction:", e);
    return { error: e.message || "An unexpected error occurred while saving to collage." };
  }
}

export async function getCollageImagesAction(): Promise<{error?: string, images?: any[]}> {
    try {
        const images = await readCollageData();
        return { images };
    } catch (e: any) {
        console.error("Error in getCollageImagesAction:", e);
        return { error: e.message || "An unexpected error occurred while fetching collage images." };
    }
}