"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="font-bold text-2xl sm:text-3xl font-headline">
              Artify
            </span>
            <span className="text-sm sm:text-base text-muted-foreground hidden xs:inline">by</span>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200">
              <Image 
                src="/icon.png" 
                alt="DevSphere Logo" 
                width={24} 
                height={24} 
                className="rounded-sm sm:w-8 sm:h-8"
              />
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">DevSphere</span>
            </div>
          </div>
        </Link>
        
        {/* Right side placeholder for future navigation */}
        <div className="flex items-center space-x-4">
          {/* Future nav items can go here */}
        </div>
      </div>
    </header>
  );
}
