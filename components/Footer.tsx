import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#7303c0]/30 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Image
                src="/assets/gen201_logo.png"
                alt="GEN 201 Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-[#928dab] text-sm leading-relaxed">
              Creating the next generation of technological innovators. 
              Join us for 24 hours of intense coding, collaboration, and innovation.
            </p>
          </div>
          
          <div>
            <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">QUICK LINKS</h3>
            <div className="space-y-2">
              {['About', 'Timeline', 'Prizes', 'Sponsors', 'FAQ', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block text-[#928dab] hover:text-[#7303c0] text-sm transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">LEGAL</h3>
            <div className="space-y-2">
              <Link
                href="/contact"
                className="block text-[#928dab] hover:text-[#7303c0] text-sm transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="/terms-conditions"
                className="block text-[#928dab] hover:text-[#7303c0] text-sm transition-colors duration-200"
              >
                Terms and Conditions
              </Link>
              <Link
                href="/cancellations-refunds"
                className="block text-[#928dab] hover:text-[#7303c0] text-sm transition-colors duration-200"
              >
                Cancellations and Refunds
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-[#928dab] hover:text-[#7303c0] text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-orbitron font-bold text-lg mb-4 text-[#7303c0]">CONNECT</h3>
            <div className="space-y-2">
              <div className="text-[#928dab] text-sm">gen201hackathon@mbcpeermade.com</div>
              <div>Noel Biju :</div>
              <div className="text-[#928dab] text-sm">+91 88482 58798</div>
              <div>Selma Anna Saju :</div>
              <div className="text-[#928dab]">+91 88482 44807</div>
              <div className="flex space-x-4 mt-4">
                <a
                  href="https://www.instagram.com/gen.201_?igsh=MW52aXV0dWtnNXlzeQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#928dab] hover:text-[#7303c0] transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/gen-two-zero-one-013a39380?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#928dab] hover:text-[#7303c0] transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
              <div className="flex items-center mt-4">
                <Image 
                  src="/assets/deptOfAI.png"
                  alt="Department of AI"
                  width={120}
                  height={60}
                  className="h-15 w-auto transform transition-transform duration-200 mt-5"
                />
              </div>
            </div>
          </div>

          
        </div>
        
        <div className="border-t border-[#7303c0]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-[#928dab] text-sm mb-4 md:mb-0">
              © 2025 GEN 201. All rights reserved. Organized by{' Department of AI'}
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
  );
}