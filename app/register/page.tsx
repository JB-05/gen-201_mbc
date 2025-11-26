import { RegistrationForm } from '@/components/registration/RegistrationForm';
import { Toaster } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
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

      {/* Floating Accent Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7303c0] rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#928dab] rounded-full opacity-10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Toaster />
      <div className="container mx-auto px-4 relative z-10">
        {/* Gradient Flowing Header */}
        <div className="text-center relative py-8">
          <div className="flex flex-col items-center ">
            <Image
              src="/assets/gen201_logo.png"
              alt="GEN 201 Logo"
              width={300}
              height={100}
              className="h-16 md:h-20 lg:h-24 w-auto"
              priority
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-orbitron gradient-text">
              Registration
            </h1>
          </div>
        </div>

        {/* Stylized Description */}
        <div className="relative">
          <p className="text-center text-[#928dab] mb-3 max-w-2xl mx-auto backdrop-blur-sm py-4 px-6 rounded-lg border border-[#7303c0]/20">
            Registration is now open! Join us in this exciting hackathon by filling out the form below.
            Don&apos;t miss out - secure your team&apos;s spot today. Make sure to provide accurate information for all team members.
          </p>
        </div>

        {/* Form Container with Backdrop Blur */}
        <div className="relative backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-[#7303c0]/20">
          <RegistrationForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-3 md:mt-2 lg:mt-4">
        
        {/* Footer Content */}
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