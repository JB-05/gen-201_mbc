'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function ContactUsPage() {
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
              Contact Us
            </h1>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0]/20 p-6 md:p-8 rounded-lg">
            <div className="space-y-6">
              <div>
                <h2 className="font-orbitron font-bold text-xl mb-4 text-[#7303c0]">CONTACT US</h2>
                <p className="text-[#928dab] mb-6">
                  If you have any questions, feel free to reach out:
                </p>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">GENERAL CONTACT</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">EMAIL</div>
                      <div className="text-[#928dab]">gen201hackathon@mbcpeermade.com</div>
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">PHONE</div>
                      <div className="text-[#928dab]">+91-8848258798</div>
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">ADDRESS</div>
                      <div className="text-[#928dab]">
                        Mar Baselios Christian College of Engineering and Technology, Kuttikkanam,<br />
                        Pallikunnu Peermade Rd, Peermade, Kuttikkanam,<br />
                        Kerala 685531
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">FACULTY COORDINATORS</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">Sobin Mathew</div>
                      <div className="text-[#928dab]">+91-9946588784</div>
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">Ajeena Ashref</div>
                      <div className="text-[#928dab]">+91-8078470896</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">STUDENT COORDINATORS</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">Noel Biju</div>
                      <div className="text-[#928dab]">+91-8848258798</div>
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">Selma Anna Saju</div>
                      <div className="text-[#928dab]">+91-8848244807</div>
                    </div>
                  </div>
                </div>
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
