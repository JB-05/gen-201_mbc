'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import heroBackground from '@/assets/hero-bg.jpg';
import NeuralBackground from './NeuralBackground';
import { NavigationLink } from './navigation/NavigationLink';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2025-10-10T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-16 md:pt-0">
      {/* Optimized Neural Network Background */}
      <NeuralBackground />
      
      {/* Optimized Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 will-change-transform" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(146, 141, 171, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(115, 3, 192, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'translate3d(0, 0, 0)',
            animation: 'gridFloat 15s ease-in-out infinite'
          }}
        ></div>
      </div>
      
      {/* Simplified Animated Overlay */}
      <div 
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(115, 3, 192, 0.1) 50%, transparent 70%)',
          backgroundSize: '300% 300%',
          transform: 'translate3d(0, 0, 0)',
          animation: 'gradientMove 12s ease-in-out infinite'
        }}
      ></div>
      
      <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/assets/gen201_logo.png"
              alt="GEN 201 Logo"
              width={450}
              height={120}
              className="h-15 sm:h-24 md:h-28 lg:h-25 lg:mt-11 md:mt-7 sm:mt-4 w-auto"
              priority
            />
          </div>
          <div className="relative inline-block">
            <p className="font-rajdhani text-base sm:text-lg md:text-xl text-[#928dab] glitch">
              CREATING THE NEXT GENERATION
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto mb-6 md:mb-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="bg-black/30 border border-[#7303c0] p-2 sm:p-4 clip-polygon relative scan-line">
              <div className="font-orbitron font-bold text-base sm:text-xl md:text-2xl text-[#928dab]">{value.toString().padStart(2, '0')}</div>
              <div className="text-[8px] sm:text-[10px] text-[#7303c0] uppercase font-medium">{unit}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-500 text-sm font-medium">Registration Ongoing</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NavigationLink
                href="/terms#eligibility"
                className="bg-[#7303c0] text-white px-3 sm:px-5 py-1.5 sm:py-2 clip-arrow font-orbitron font-bold text-xs hover:bg-[#928dab] transition-all duration-300 transform hover:scale-105"
                variant="button"
              >
                CHECK ELIGIBILITY
              </NavigationLink>
              <NavigationLink
                href="/register"
                className="inline-block bg-[#7303c0] text-white px-4 sm:px-6 py-2 sm:py-3 clip-arrow font-orbitron font-bold text-sm sm:text-base hover:bg-[#928dab] transition-all duration-300 transform hover:scale-105 relative animate-pulse-subtle"
              >
                REGISTER NOW
                <span className="absolute inset-0 border-2 border-[#7303c0] clip-arrow animate-ping-slow opacity-75"></span>
              </NavigationLink>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mt-6">
            <a
              href="https://www.instagram.com/gen.201_?igsh=MW52aXV0dWtnNXlzeQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#928dab] hover:text-[#7303c0] transition-colors duration-200 transform hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/gen-two-zero-one-013a39380?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#928dab] hover:text-[#7303c0] transition-colors duration-200 transform hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
          
          {/* Quick Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 max-w-2xl mx-auto">
            <div className="bg-black/30 border border-[#7303c0] p-3 sm:p-4 clip-polygon">
              <div className="font-orbitron font-bold text-[10px] sm:text-xs text-[#7303c0]">DATE</div>
              <div className="font-medium text-xs sm:text-sm text-[#928dab]">OCT 10-11, 2025</div>
            </div>
            <div className="bg-black/30 border border-[#7303c0] p-3 sm:p-4 clip-polygon">
              <div className="font-orbitron font-bold text-[10px] sm:text-xs text-[#7303c0]">VENUE</div>
              <div className="font-medium text-xs sm:text-sm text-[#928dab]">MAIN CAMPUS</div>
            </div>
            <div className="bg-black/30 border border-[#7303c0] p-3 sm:p-4 clip-polygon sm:col-span-2 md:col-span-1">
              <div className="font-orbitron font-bold text-[10px] sm:text-xs text-[#7303c0]">PRIZES</div>
              <div className="font-medium text-xs sm:text-sm text-[#928dab]">₹50K+ TOTAL</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}