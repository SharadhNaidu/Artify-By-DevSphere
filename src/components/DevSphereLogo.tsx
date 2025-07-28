"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface DevSphereLogoProps {
  size?: number;
  className?: string;
}

export default function DevSphereLogo({ size = 24, className }: DevSphereLogoProps) {
  return (
    <div 
      className={cn(
        "rounded-md bg-black border border-gray-600 flex items-center justify-center shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
        style={{ width: size * 0.7, height: size * 0.7 }}
      >
        {/* Sphere/Globe design */}
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        {/* Horizontal lines representing latitude */}
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1"/>
        <path d="M5.5 8h13" stroke="currentColor" strokeWidth="0.8"/>
        <path d="M5.5 16h13" stroke="currentColor" strokeWidth="0.8"/>
        {/* Vertical curve representing longitude */}
        <path d="M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1"/>
        <path d="M12 3c3 3 3 15 0 18" stroke="currentColor" strokeWidth="1"/>
        {/* Central dot for "Dev" */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  );
}
