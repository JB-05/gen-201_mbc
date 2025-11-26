'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
                <p>Open to Higher Secondary students (Classes 11–12) currently enrolled in schools in Kerala.</p>
                <p>Valid student ID card must be produced at registration and during the event.</p>
                <p>All shortlisted teams must submit a Letter of Recognition (LOR) signed by:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Parent/Guardian (consent for participation), and</li>
                  <li>Principal/Headmaster (with school seal).</li>
                </ul>
                <p>Organizers, faculty coordinators, and direct volunteers are not allowed to participate.</p>
              </div>
            </section>

            {/* Section 2: Team Formation */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">2. Team Formation</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Teams may consist of 2 to 4 members, with one designated leader.</p>
                <p>Inter-school teams are permitted, provided all members are from Kerala schools.</p>
                <p>Teams may have a teacher/mentor, but mentors cannot directly work on the project.</p>
              </div>
            </section>

            {/* Section 3: Registration & Payment */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">3. Registration & Payment</h2>
              <div className="space-y-4 text-[#928dab]">
                <div>
                  <h3 className="text-lg font-semibold text-[#7303c0] mb-2">3.1 Registration Process</h3>
                  <div className="space-y-2">
                    <p>Registration must be completed online in the prescribed format before the deadline.</p>
                    <p>Each team must submit:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>One idea and</li>
                      <li>1–5 possible solution approaches for that idea.</li>
                    </ul>
                    <p>No team changes will be permitted after registration closes.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#7303c0] mb-2">3.2 Payment Terms</h3>
                  <div className="space-y-2">
                    <p>The registration fee is ₹50 (plus applicable Razorpay commission/extra charges).</p>
                    <p>This fee is collected solely for administrative processing and idea submission.</p>
                    <p className="font-medium">Important Payment Conditions:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>All payments are strictly non-refundable under normal circumstances</li>
                      <li>This includes cases of idea rejection, withdrawal, or non-attendance</li>
                      <li>Payment does not guarantee selection into the offline hackathon</li>
                      <li>No priority or preference in evaluation is given based on payment timing</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#7303c0] mb-2">3.3 Payment Gateway</h3>
                  <div className="space-y-2">
                    <p>All payments are processed securely through Razorpay.</p>
                    <p>The organizing committee and Gen 201 team are not responsible for:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Technical issues during payment</li>
                      <li>Transaction failures</li>
                      <li>Payment delays</li>
                      <li>Duplicate payments</li>
                    </ul>
                    <p>These issues may arise from either Razorpay or the participant&apos;s banking provider.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#7303c0] mb-2">3.4 Refund Policy</h3>
                  <div className="space-y-2">
                    <p>Refunds will only be considered in exceptional circumstances such as:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Political causes</li>
                      <li>Economic causes</li>
                      <li>Environmental causes</li>
                    </ul>
                    <p>The refund decision in such cases shall be made solely by the Gen 201 Organizing Team and will be final and binding.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Shortlisting */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">4. Shortlisting Process</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Teams will be shortlisted (maximum 125 teams) based on the uniqueness and presentation quality of their submitted idea.</p>
                <p>Incomplete or incorrect applications will lead to rejection.</p>
                <p>The selection of participants will be based solely on the evaluation of submitted ideas.</p>
                <p>The decision of the organizing team regarding selection is final and binding.</p>
              </div>
            </section>

            {/* Section 5: Project & Submission Rules */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">5. Project & Submission Rules</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Projects must be developed entirely during the hackathon (24 hours).</p>
                <p>Use of open-source tools, frameworks, and APIs is allowed with proper credit.</p>
                <p>Plagiarism, pre-built projects, or copied solutions will lead to disqualification.</p>
                <p>Final submission must include:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Code repository link,</li>
                  <li>Project presentation (PPT/PDF), and</li>
                  <li>Demo (if required).</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Event Conduct */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">6. Event Conduct</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>The hackathon is strictly time-bound (24 hours).</p>
                <p>Participants must maintain respectful and professional behavior. Misconduct, cheating, or inappropriate acts will result in disqualification.</p>
                <p>All teams must adhere to the instructions given by the organizing committee.</p>
              </div>
            </section>

            {/* Section 6: Evaluation */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">7. Evaluation</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Evaluation will be based on:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Innovation & originality,</li>
                  <li>Practical feasibility,</li>
                  <li>Technical implementation, and</li>
                  <li>Presentation quality.</li>
                </ul>
                <p>The decision of the judging panel and organizing committee is final and binding.</p>
              </div>
            </section>

            {/* Section 7: Prizes & Recognition */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">8. Prizes & Recognition</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Winning teams will be awarded cash prizes and certificates.</p>
                <p>All participants who complete the hackathon will receive a certificate of participation.</p>
                <p>Special recognition may be given for outstanding innovation or unique contributions.</p>
              </div>
            </section>

            {/* Section 8: Disclaimer */}
            <section>
              <h2 className="text-2xl font-orbitron font-bold text-[#7303c0] mb-4">9. Disclaimer</h2>
              <div className="space-y-2 text-[#928dab]">
                <p>Participation is voluntary. Organizers are not responsible for personal expenses, injuries, or loss of belongings.</p>
                <p>The organizing committee reserves the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Verify eligibility,</li>
                  <li>Disqualify teams for violations,</li>
                  <li>Modify rules or event format if required.</li>
                </ul>
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
