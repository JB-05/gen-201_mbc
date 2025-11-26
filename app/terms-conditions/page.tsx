'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsConditionsPage() {
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
              Terms & Conditions
            </h1>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0]/20 p-6 md:p-8 rounded-lg space-y-8">
            {/* Section 1: Eligibility */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">1. Eligibility</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Participation is open only to eligible students (11th & 12th standard, as specified).</p>
                <p>Valid student ID card must be produced at registration and during the event.</p>
                <p>All participants must be currently enrolled in schools in Kerala.</p>
                <p>Organizers, faculty coordinators, and direct volunteers are not allowed to participate.</p>
              </div>
            </section>

            {/* Section 2: Team Formation & Rules */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">2. Team Formation & Rules</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Teams must adhere to the rules and guidelines provided by the organizers.</p>
                <p>All team members must meet the eligibility criteria as specified.</p>
                <p>Teams may consist of 1 to 4 members, with one designated leader.</p>
                <p>Inter-school teams are permitted, provided all members are from Kerala schools.</p>
              </div>
            </section>

            {/* Section 3: Submission Requirements */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">3. Submission Requirements</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>All submissions must be original. Plagiarized ideas will lead to disqualification.</p>
                <p>Projects must be developed entirely during the hackathon period.</p>
                <p>Use of open-source tools, frameworks, and APIs is allowed with proper credit.</p>
                <p>Final submission must include:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Code repository link,</li>
                  <li>Project presentation (PPT/PDF), and</li>
                  <li>Demo (if required).</li>
                </ul>
              </div>
            </section>

            {/* Section 4: Event Conduct */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">4. Event Conduct</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>The organizers reserve the right to modify the event schedule, rules, or judging process if required.</p>
                <p>Participants must maintain respectful and professional behavior throughout the event.</p>
                <p>Misconduct, cheating, or inappropriate acts will result in disqualification.</p>
                <p>All teams must adhere to the instructions given by the organizing committee.</p>
              </div>
            </section>

            {/* Section 5: Evaluation & Judging */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">5. Evaluation & Judging</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Evaluation will be based on:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Innovation & originality,</li>
                  <li>Practical feasibility,</li>
                  <li>Technical implementation, and</li>
                  <li>Presentation quality.</li>
                </ul>
                <p>The decision of the judging panel will be final and binding.</p>
                <p>The organizing committee reserves the right to verify eligibility and disqualify teams for violations.</p>
              </div>
            </section>

            {/* Section 6: Disclaimer */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">6. Disclaimer</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Participation is voluntary. Organizers are not responsible for personal expenses, injuries, or loss of belongings.</p>
                <p>The organizing committee reserves the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Verify eligibility,</li>
                  <li>Disqualify teams for violations,</li>
                  <li>Modify rules or event format if required.</li>
                </ul>
                <p>For any questions regarding these terms, please contact us at gen201hackathon@mbcpeermade.com</p>
              </div>
            </section>
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
