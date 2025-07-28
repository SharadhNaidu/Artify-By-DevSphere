"use client";

import { useState, useRef, useCallback, type ChangeEvent, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Video, VideoOff, Check, XCircle, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PhotoInputProps {
  onPhotoSelected: (dataUri: string | null) => void;
  photoDataUri: string | null;
}

export default function PhotoInput({ onPhotoSelected, photoDataUri }: PhotoInputProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check camera support on component mount
  useEffect(() => {
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        return;
      }
      
      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        console.warn("Camera requires HTTPS or localhost");
        setCameraSupported(false);
        return;
      }
      
      setCameraSupported(true);
    };
    
    checkCameraSupport();
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current || isCameraLoading) return;
    setIsCameraLoading(true);
    try {
      // Allow switching between front and rear cameras
      const constraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        },
        audio: false
      };
      console.log("Requesting camera access...", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const video = videoRef.current;
        const handleLoadedData = () => {
          console.log("Video loaded successfully");
          setIsCameraActive(true);
          setIsCameraLoading(false);
          setHasCameraPermission(true);
          toast({
            title: "Camera Started",
            description: `Camera is now active (${cameraFacingMode === 'user' ? 'Front' : 'Rear'}). Position yourself and click capture.`,
          });
        };
        const handleError = (e: Event) => {
          console.error("Video error:", e);
          setIsCameraLoading(false);
          setIsCameraActive(false);
          stopCamera();
          toast({
            variant: "destructive",
            title: "Video Error",
            description: "There was an issue with the camera feed. Please try again.",
          });
        };
        video.addEventListener('loadeddata', handleLoadedData, { once: true });
        video.addEventListener('error', handleError, { once: true });
        try {
          await video.play();
        } catch (playError) {
          console.error("Video play error:", playError);
        }
        setTimeout(() => {
          if (isCameraLoading && !isCameraActive) {
            console.log("Camera loading timeout, forcing active state");
            setIsCameraActive(true);
            setIsCameraLoading(false);
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setHasCameraPermission(false);
      setIsCameraActive(false);
      setIsCameraLoading(false);
      let errorMessage = "Please allow camera access in your browser settings to use this feature.";
      if (err instanceof Error) {
        if (err.message.includes("Permission denied") || err.name === "NotAllowedError") {
          errorMessage = "Camera permission denied. Please allow camera access and try again.";
        } else if (err.message.includes("not found") || err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Camera took too long to start. Please try again.";
        }
      }
      toast({
        variant: "destructive",
        title: "Camera Access Failed",
        description: errorMessage,
      });
    }
  }, [toast, isCameraLoading, isCameraActive, cameraFacingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if(videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value !== 'camera') {
      stopCamera();
    }
  };

  const processFile = (file: File) => {
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoSelected(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }
        
        // Flip the image horizontally to un-mirror it (since we show mirrored preview)
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        // Convert to data URL
        const dataUri = canvas.toDataURL("image/jpeg", 0.9); // 90% quality
        
        onPhotoSelected(dataUri);
        stopCamera();
        
        toast({
          title: "Photo Captured!",
          description: "Your photo has been captured successfully.",
        });
        
      } catch (error) {
        console.error("Error capturing photo:", error);
        toast({
          variant: "destructive",
          title: "Capture Failed",
          description: "There was an error capturing the photo. Please try again.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Camera Not Ready",
        description: "Please wait for the camera to fully load and try again.",
      });
    }
  };

  const clearPhoto = () => {
    onPhotoSelected(null);
  }

  const openFileDialog = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="w-full">
      {photoDataUri ? (
        <Alert variant="default" className="border-green-500 bg-green-500/10">
          <div className="flex flex-wrap xs:flex-nowrap items-center gap-2 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 border-green-500/50">
                <Image src={photoDataUri} alt="Selected photo preview" layout="fill" objectFit="cover" />
              </div>
              <div className="flex-grow">
                <AlertTitle className="text-green-300 text-sm sm:text-base">Photo Selected!</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                    You can now proceed to select a style.
                </AlertDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearPhoto} className="mt-2 xs:mt-0 sm:self-start">
                  <XCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Clear</span>
              </Button>
          </div>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="text-xs sm:text-sm py-1 sm:py-2">
                <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Upload Photo
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-xs sm:text-sm py-1 sm:py-2">
                <Camera className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Use Camera
            </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div 
                className={cn(
                  "relative mt-2 flex flex-col items-center justify-center w-full h-36 sm:h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors",
                  isDragging && "border-primary bg-primary/10"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                  <div className="flex flex-col items-center justify-center p-3 sm:pt-5 sm:pb-6 text-center">
                      <FileUp className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-muted-foreground" />
                      <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">JPG, PNG, WEBP (max 4MB)</p>
                  </div>
                  <Input 
                    ref={fileInputRef}
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp" 
                    onChange={handleFileChange}
                  />
              </div>
            </TabsContent>
            <TabsContent value="camera">
            <div className="p-2 sm:p-4 border rounded-b-md">
                {cameraSupported === false ? (
                  <div className="text-center flex flex-col items-center gap-3 sm:gap-4 py-6">
                    <div className="w-full h-32 sm:h-40 bg-muted/30 rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Camera not available</p>
                      </div>
                    </div>
                    <Alert variant="destructive" className="text-xs sm:text-sm">
                      <AlertTitle className="text-xs sm:text-sm">Camera Not Supported</AlertTitle>
                      <AlertDescription className="text-xs sm:text-sm">
                        Camera access requires HTTPS or localhost. Please use the upload option instead.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : isCameraLoading ? (
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="relative w-full h-48 sm:h-64 bg-muted/30 rounded-md flex items-center justify-center border-2 border-dashed border-primary/20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Starting camera...</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={stopCamera} size="sm" className="text-xs sm:text-sm h-8 sm:h-10">
                        <VideoOff className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : isCameraActive ? (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="relative w-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-md aspect-video bg-muted object-cover border-2 border-primary/20"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video for selfie effect
                      onLoadedData={() => {
                        // Check if video is rendering frames
                        if (videoRef.current && videoRef.current.videoWidth === 0) {
                          toast({
                            variant: "destructive",
                            title: "Camera Feed Error",
                            description: "Camera is on, but no video is being rendered. Try switching cameras or check device permissions.",
                          });
                        }
                      }}
                      onError={(e) => {
                        toast({
                          variant: "destructive",
                          title: "Video Element Error",
                          description: "There was an error displaying the camera feed. Try refreshing or using a different device.",
                        });
                        console.error("Video element error:", e);
                      }}
                    />
                    {/* Show error if video is black or not rendering */}
                    {videoRef.current && videoRef.current.videoWidth === 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base">
                        Camera is on, but no video is visible. Try switching cameras or check device permissions.
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} size="sm" className="text-xs sm:text-sm h-8 sm:h-10"><Camera className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Capture</Button>
                    <Button variant="outline" onClick={stopCamera} size="sm" className="text-xs sm:text-sm h-8 sm:h-10"><VideoOff className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Stop Camera</Button>
                    <Button variant="secondary" onClick={() => {
                      // Switch between front and rear camera
                      setCameraFacingMode((prev) => prev === 'user' ? 'environment' : 'user');
                      stopCamera();
                      setTimeout(() => startCamera(), 300); // restart camera after switching
                    }} size="sm" className="text-xs sm:text-sm h-8 sm:h-10">
                      <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Switch Camera
                    </Button>
                  </div>
                </div>
                ) : (
                <div className="text-center flex flex-col items-center gap-3 sm:gap-4 py-3 sm:py-4">
                    <div className="w-full h-32 sm:h-40 bg-muted/30 rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                      <div className="text-center">
                        <Camera className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Camera preview will appear here</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Position yourself and capture a new photo.</p>
                    <Button 
                      onClick={startCamera} 
                      size="sm" 
                      className="text-xs sm:text-sm h-8 sm:h-10"
                      disabled={cameraSupported !== true}
                    >
                        <Video className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Start Camera
                    </Button>
                    {hasCameraPermission === false && (
                         <Alert variant="destructive" className="text-xs sm:text-sm mt-2">
                            <AlertTitle className="text-xs sm:text-sm">Camera Permission Denied</AlertTitle>
                            <AlertDescription className="text-xs sm:text-sm">
                                Please enable camera access in your browser settings and refresh the page. Make sure you're using HTTPS or localhost.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                )}
            </div>
            </TabsContent>
        </Tabs>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
