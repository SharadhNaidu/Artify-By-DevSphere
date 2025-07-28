"use client";

import { useState } from "react";
import { ArtStyle, artStyles, artStyleCategories } from "@/lib/constants";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { 
  Palette, 
  Brush, 
  Pencil, 
  Camera,
  Wand2,
  Sparkles,
  Gamepad2,
  Image,
  PaintBucket,
  Layers,
  Pen,
  Edit3,
  Zap,
  Star,
  Heart,
  Crown,
  Focus,
  Filter,
  Lightbulb,
  Droplet,
  Feather,
  Scissors,
  Triangle,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Eye,
  Sun,
  Moon,
  Cloud,
  Mountain,
  Flower,
  Leaf,
  Flame,
  Snowflake,
  Music,
  Play,
  Pause,
  FastForward
} from "lucide-react";

interface ArtStyleGridProps {
  onStyleSelect: (style: ArtStyle) => void;
  selectedStyleId: string | null;
}

export default function ArtStyleGrid({ onStyleSelect, selectedStyleId }: ArtStyleGridProps) {
  
  const sortedStyles = (category: string) => 
    artStyles
      .filter(style => style.category === category)
      .sort((a, b) => b.usageCount - a.usageCount);

  // Get appropriate icon for each art style
  const getStyleIcon = (style: ArtStyle) => {
    const iconMap: { [key: string]: any } = {
      // Painting Styles - Art tools and creative elements
      "Impasto Oil": Droplet,
      "Acrylic Pop": Triangle,
      "Renaissance Oil": Crown,
      "Chinese Ink Wash": Feather,
      
      // Drawing & Sketch - Drawing and line tools
      "Graphite Portrait": Pencil,
      "Charcoal Drama": Flame,
      "Technical Ink": Pen,
      "Colored Pencil": Circle,
      "Chalk Pastel": Cloud,
      
      // Anime & Manga - Playful and energetic
      "Studio Ghibli": Heart,
      "Manga Style": Star,
      "Anime Portrait": Zap,
      "Chibi Art": Sun,
      "Kawaii Style": Flower,
      "Shoujo Style": Diamond,
      
      // Video Game Art - Gaming and tech
      "Pixel Art": Square,
      "3D Render": Hexagon,
      "Fantasy Art": Mountain,
      "Minecraft Style": Layers,
      "Fortnite Style": Play,
      
      // Photography Effects - Camera and visual effects
      "Vintage Film": Camera,
      "HDR Effect": Eye,
      "Black & White": Moon,
      "Film Noir": Scissors,
      "Double Exposure": Focus,
      "Vintage Sepia": Leaf,
      "Lomography": Filter,
      "Polaroid Instant": Image,
      "HDR Surreal": Lightbulb,
      "Cross Process": Snowflake,
      "Long Exposure": FastForward,
      "Infrared Photography": Music,
      "Tilt-Shift Miniature": Pause,
      "Pinhole Camera": Sparkles,
      "Cyanotype Blue": Wand2,
      "Daguerreotype": Brush
    };
    
    return iconMap[style.name] || Palette;
  };

  // Category-based color schemes with different shades
  const getCategoryGradient = (category: string, index: number) => {
    const categoryColors = {
      "Painting Styles": {
        base: "orange",
        gradients: [
          "bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300",
          "bg-gradient-to-br from-orange-50 via-orange-200 to-orange-300", 
          "bg-gradient-to-br from-amber-100 via-orange-200 to-orange-300",
          "bg-gradient-to-br from-orange-100 via-amber-200 to-amber-300",
          "bg-gradient-to-br from-orange-100 via-rose-200 to-rose-300"
        ]
      },
      "Drawing & Sketch": {
        base: "slate",
        gradients: [
          "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300",
          "bg-gradient-to-br from-slate-50 via-slate-200 to-slate-300",
          "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300", 
          "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300",
          "bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300"
        ]
      },
      "Anime & Manga": {
        base: "pink",
        gradients: [
          "bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300",
          "bg-gradient-to-br from-pink-200 via-pink-300 to-rose-300",
          "bg-gradient-to-br from-rose-100 via-rose-200 to-rose-300",
          "bg-gradient-to-br from-fuchsia-100 via-pink-200 to-pink-300",
          "bg-gradient-to-br from-pink-100 via-fuchsia-200 to-fuchsia-300",
          "bg-gradient-to-br from-purple-100 via-pink-200 to-pink-300"
        ]
      },
      "Video Game Art": {
        base: "emerald",
        gradients: [
          "bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300",
          "bg-gradient-to-br from-emerald-200 via-emerald-300 to-green-300",
          "bg-gradient-to-br from-green-100 via-emerald-200 to-emerald-300",
          "bg-gradient-to-br from-teal-100 via-emerald-200 to-emerald-300",
          "bg-gradient-to-br from-lime-100 via-green-200 to-green-300"
        ]
      },
      "Photography Effects": {
        base: "blue",
        gradients: [
          "bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300",
          "bg-gradient-to-br from-blue-200 via-blue-300 to-sky-300",
          "bg-gradient-to-br from-sky-100 via-blue-200 to-blue-300",
          "bg-gradient-to-br from-indigo-100 via-blue-200 to-blue-300",
          "bg-gradient-to-br from-cyan-100 via-blue-200 to-blue-300",
          "bg-gradient-to-br from-slate-100 via-indigo-200 to-indigo-300",
          "bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300",
          "bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-300",
          "bg-gradient-to-br from-blue-100 via-cyan-200 to-cyan-300"
        ]
      }
    };

    const categoryScheme = categoryColors[category as keyof typeof categoryColors];
    if (!categoryScheme) return "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300";
    
    return categoryScheme.gradients[index % categoryScheme.gradients.length];
  };

  return (
    <Tabs defaultValue={artStyleCategories[0]} className="w-full">
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <TabsList className="bg-muted/30 p-1 h-auto flex flex-nowrap min-w-max">
          {artStyleCategories.map((category) => (
            <TabsTrigger key={category} value={category} className="px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {artStyleCategories.map((category) => (
        <TabsContent key={category} value={category} className="mt-4 sm:mt-6">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
              {sortedStyles(category).map((style, index) => {
                const IconComponent = getStyleIcon(style);
                return (
                  <Card
                    key={style.id}
                    onClick={() => onStyleSelect(style)}
                    className={cn(
                      "cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-102 sm:hover:scale-105 border-2 rounded-xl overflow-hidden group relative",
                      selectedStyleId === style.id 
                        ? "ring-2 sm:ring-4 ring-primary ring-offset-1 sm:ring-offset-2 border-primary shadow-xl scale-102 sm:scale-105" 
                        : "border-border/50 hover:border-primary/50 shadow-lg"
                    )}
                  >
                    <CardContent className="p-0 relative aspect-square w-full">
                       {/* Gradient Background */}
                       <div className={cn(
                         "absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300",
                         getCategoryGradient(category, index)
                       )}></div>
                       
                       {/* Overlay Pattern */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20"></div>
                       
                       {/* Content */}
                       <div className="relative h-full w-full flex flex-col items-center justify-center p-1 sm:p-2">
                          {/* Icon */}
                          <IconComponent className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-700 drop-shadow-sm mb-1 sm:mb-2" />
                          
                          {/* Title */}
                          <div className="bg-white/70 backdrop-blur-sm rounded-md px-1 py-0.5 sm:px-2 sm:py-1 border border-gray-200/50 shadow-sm">
                            <h3 className="text-[10px] xs:text-xs sm:text-sm font-bold text-center text-gray-800 leading-tight">{style.name}</h3>
                          </div>
                       </div>
                       
                       {/* Selected Indicator */}
                       {selectedStyleId === style.id && (
                         <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-primary rounded-full flex items-center justify-center">
                           <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-white rounded-full"></div>
                         </div>
                       )}
                       
                       {/* Hover Effect */}
                       <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
