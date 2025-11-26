'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black pt-24 pb-16 relative overflow-hidden">
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm border border-[#7303c0] 
                     rounded-lg text-[#928dab] hover:text-white hover:bg-[#7303c0] transition-all duration-300
                     hover:scale-105 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-orbitron">Back to Home</span>
        </Link>
      </div>

      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(115, 3, 192, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(115, 3, 192, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Radial Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(115, 3, 192, 0.15) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/assets/gen201_logo.png"
              alt="GEN 201 Logo"
              width={200}
              height={67}
              className="h-12 md:h-16 w-auto mx-auto mb-4"
              priority
            />
            <h1 className="text-3xl md:text-4xl font-orbitron font-black gradient-text">
              Privacy Policy
            </h1>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0]/20 p-6 md:p-8 rounded-lg">
            <div className="space-y-6">
              <div>
                <h2 className="font-orbitron font-bold text-xl mb-4 text-[#7303c0]">PRIVACY POLICY</h2>
                <p className="text-[#928dab] mb-6">
                  We respect your privacy and are committed to handling your personal information responsibly.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[#928dab] mb-4">
                    Collected data (such as name, email, phone number, and school details) will be used for event communication, coordination, and other related purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-3 text-[#7303c0]">WE MAY ALSO USE THE INFORMATION TO:</h3>
                  <ul className="text-[#928dab] space-y-2 ml-4">
                    <li>• Share details about future events, workshops, and initiatives organized by us or our partners.</li>
                    <li>• Improve our services and gather feedback for research and development.</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-[#928dab] mb-4">
                    Your details will not be sold to third parties. However, they may be shared with trusted partners or sponsors for educational and event-related purposes.
                  </p>
                </div>
                
                <div>
                  <p className="text-[#928dab] mb-4">
                    By registering, you consent to the collection and usage of your information as outlined above.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#7303c0]">
                <p className="text-[#928dab] text-sm">
                  For privacy-related questions or concerns, please contact us at gen201hackathon@mbcpeermade.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16">
        <div className="bg-[#0a0a0a]/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-[#928dab] text-sm">
                © {new Date().getFullYear()} GEN 201. All rights reserved.
              </div>
              <div className="flex items-center gap-2 text-[#928dab] text-sm">
                <span>Designed and developed by</span>
                <a
                  href="https://ugenix.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block h-8 transition-transform hover:scale-105 hover:opacity-80"
                >
                  <Image
                    src="/assets/ugenix.svg"
                    alt="UgeniX"
                    width={100}
                    height={32}
                    className="h-full w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
