'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Systems');

  useEffect(() => {
    const loadingTexts = [
      'Initializing Systems',
      'Establishing Neural Links',
      'Synchronizing Data Streams',
      'Calibrating AI Modules',
      'Loading Virtual Environment'
    ];

    let currentTextIndex = 0;
    const textInterval = setInterval(() => {
      currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentTextIndex]);
    }, 1000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          // Call onLoadingComplete after a short delay to show 100%
          setTimeout(() => {
            onLoadingComplete?.();
          }, 300);
          return 100;
        }
        return next;
      });
    }, 20);

    // Ensure loading completes within max duration
    const maxDuration = setTimeout(() => {
      setProgress(100);
      clearInterval(progressInterval);
      clearInterval(textInterval);
      onLoadingComplete?.();
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(maxDuration);
    };
  }, [onLoadingComplete]);

  return (
    <div className="loading-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black p-4 sm:p-6">
      {/* Neural Network Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-futuristic opacity-30" />
        <div className="scan-line" />
      </div>

      {/* Main Title */}
      <div className="relative mb-4 sm:mb-8 text-center">
        <div className="flex items-center justify-center">
          <Image
            src="/assets/gen201_logo.png"
            alt="GEN 201 Logo"
            width={300}
            height={100}
            className="h-16 sm:h-20 md:h-28 w-auto animate-pulse"
            priority
          />
        </div>
      </div>

      {/* Loading Text with Glitch Effect */}
      <div className="mb-4 sm:mb-6 text-center px-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-orbitron text-[#7303c0] glitch whitespace-normal">
          {loadingText}
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="w-[80%] sm:w-64 h-1.5 sm:h-2 bg-black/50 rounded-full overflow-hidden border border-[#7303c0] relative">
        <div
          className="h-full bg-gradient-to-r from-[#7303c0] to-[#928dab] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7303c0]/20 to-transparent animate-[flowingLine_2s_linear_infinite]" />
      </div>

      {/* Progress Percentage */}
      <div className="mt-2 sm:mt-4">
        <span className="font-mono text-[#928dab] text-xs sm:text-sm">
          {progress}% Complete
        </span>
      </div>

      {/* Powered by Department of AI */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center">
        <p className="text-[#928dab] text-xs sm:text-sm mb-2 font-light">
          powered by
        </p>
        <div className="relative opacity-80 hover:opacity-100 transition-all duration-300">
          <Image
            src="/assets/deptOfAI.png"
            alt="Department of AI Logo"
            width={96}
            height={96}
            className="h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain"
            priority
          />
        </div>
      </div>

      {/* Hexagon Grid Background */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <svg width="100%" height="100%" className="scale-[1.5] sm:scale-100">
          <pattern
            id="hexagons"
            width="25"
            height="21.7"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2) rotate(0)"
          >
            <path
              d="M12.5,0 L25,7.15 L25,14.55 L12.5,21.7 L0,14.55 L0,7.15 Z"
              fill="none"
              stroke="#7303c0"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>


      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7303c0]/5 to-transparent opacity-20"
          style={{
            animation: 'scan 2s linear infinite',
            transform: 'translateY(-100%)'
          }}
        />
      </div>
    </div>
  );
}