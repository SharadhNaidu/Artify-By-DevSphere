"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PhotoInput from "@/components/PhotoInput";
import ArtStyleGrid from "@/components/ArtStyleGrid";
import type { ArtStyle } from "@/lib/constants";
import { generatePreviewAction } from "./actions";
import { Download, Image as ImageIcon, ArrowDown } from "lucide-react";

export default function ArtifyClient() {
  const { toast } = useToast();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);
  
  const [isPreviewLoading, startPreviewTransition] = useTransition();

  const handlePhotoSelected = (dataUri: string | null) => {
    if (dataUri === null) {
      setUserPhoto(null);
      setPreviewImage(null);
      setSelectedStyle(null);
    } else {
      setUserPhoto(dataUri);
      setPreviewImage(null);
    }
  };

  const handleStyleSelect = (style: ArtStyle) => {
    setSelectedStyle(style);
    if (!userPhoto) {
      toast({
        title: "Upload a Photo First",
        description: "You need to provide a photo before selecting a style.",
      });
      return;
    }
    
    startPreviewTransition(async () => {
      setPreviewImage(null);
      const result = await generatePreviewAction({
        photoDataUri: userPhoto,
        artStyleDescription: style.prompt,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Preview Failed",
          description: result.error,
        });
        setPreviewImage(null);
      } else {
        setPreviewImage(result.previewDataUri!);
      }
    });
  };
  
  const handleDownload = () => {
    // Download the currently displayed image (preview or original)
    const imageToDownload = previewImage || userPhoto;
    
    if (!imageToDownload) {
      toast({
        title: "No Image to Download",
        description: "Please select a photo and art style first.",
      });
      return;
    }
    
    // Trigger download of the current image
    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `artify_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your image is being downloaded.",
    });
  };

  const displayImage = previewImage || userPhoto;
  const isLoading = isPreviewLoading;

  return (
    <div className="container mx-auto max-w-6xl py-6 px-3 sm:py-8 sm:px-4 md:py-12 flex flex-col items-center gap-6 sm:gap-8 md:gap-12 overflow-x-hidden">

      {/* Step 1: Provide Photo */}
      <section id="step-1" className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4 md:gap-8 mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 self-center">
          <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 sm:h-8 sm:w-8 text-sm sm:text-md flex items-center justify-center font-bold">1</span>
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Provide a Photo</h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Upload an existing photo or capture a new one with your camera.</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 md:mt-8 w-full">
          <PhotoInput onPhotoSelected={handlePhotoSelected} photoDataUri={userPhoto} />
        </div>
      </section>

      {userPhoto && (
        <>
          <ArrowDown className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground mx-auto" />

          {/* Step 2: Choose Style */}
          <section id="step-2" className="w-full flex flex-col items-center gap-3 sm:gap-4 md:gap-8 mx-auto">
            <div className="flex items-center gap-2 sm:gap-4 self-center">
              <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 sm:h-8 sm:w-8 text-sm sm:text-md flex items-center justify-center font-bold">2</span>
              <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Choose an Art Style</h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Select a style to transform your photo. A preview will appear below.</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 md:mt-8 w-full">
              <ArtStyleGrid onStyleSelect={handleStyleSelect} selectedStyleId={selectedStyle?.id || null} />
            </div>
          </section>

          {(selectedStyle || previewImage) && (
            <>
              <ArrowDown className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-muted-foreground mx-auto" />

              {/* Step 3: Your Artwork */}
              <section id="step-3" className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4 md:gap-8 mx-auto">
                 <div className="flex items-center gap-2 sm:gap-4 self-center">
                  <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 sm:h-8 sm:w-8 text-sm sm:text-md flex items-center justify-center font-bold">3</span>
                  <div className="flex flex-col">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-headline">Generate & Download</h2>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Click the button to create the high-resolution artwork and download it.</p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 md:mt-8 w-full max-w-2xl flex flex-col gap-3 sm:gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-2 sm:p-4">
                       <div className="relative w-full aspect-square rounded-lg bg-muted/30 border-2 border-dashed flex items-center justify-center overflow-hidden">
                          {isLoading ? (
                            <Skeleton className="w-full h-full" />
                          ) : displayImage ? (
                            <Image src={displayImage} alt="User artwork" layout="fill" objectFit="contain" />
                          ) : (
                            <div className="text-center text-muted-foreground p-4">
                              <ImageIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-1 sm:mb-2 md:h-12 md:w-12" />
                              <p className="text-xs sm:text-sm md:text-base">Select a photo and style</p>
                            </div>
                          )}
                          {isPreviewLoading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold backdrop-blur-sm text-xs sm:text-sm md:text-base">Generating Preview...</div>}
                       </div>
                    </CardContent>
                  </Card>
                 
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    disabled={!userPhoto || !selectedStyle || isPreviewLoading}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base md:h-14 md:text-lg bg-accent text-accent-foreground font-bold shadow-lg hover:bg-accent/90 transition-all transform hover:scale-105"
                  >
                    Download Image
                    <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </Button>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
