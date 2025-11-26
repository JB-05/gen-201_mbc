'use client';

import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Who can participate in GEN 201?',
      answer: 'GEN 201 is open to all students of class 11 and 12. Teams can consist of 2-4 members from any academic background are allowed.'
    },
    {
      question: 'Is it necessary to have thrmal insulating clothes?',
      answer: 'Yes, for you comfort, ensure that you are wearing thermal insulating clothes.'
    },
    {
      question: 'What is the registration process?',
      answer: 'Registration opens on September 1st. Simply fill out the online form with your team details, project ideas, and member information. Registration closes on September 20th.'
    },
    {
      question: 'Do I need to have a team before registering?',
      answer: 'Team of minimum two members are required for registration.'
    },
    {
      question: 'What technologies can we use?',
      answer: 'Any programming language, framework, or technology stack is allowed. We encourage the use of cutting-edge technologies, especially those related to AI, ML, and emerging tech domains.'
    },
    {
      question: 'Will food and accommodation be provided?',
      answer: 'Meals and refreshments will be provided throughout the 24-hour event. Accommodation arrangements can be made for outstation participants upon request.'
    },
    {
      question: 'What are the judging criteria?',
      answer: 'Projects will be evaluated based on innovation, technical implementation, impact potential, presentation quality, and overall execution within the given timeframe.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-black/95">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6 tracking-wider">
            FREQUENTLY ASKED <span className="text-[#928dab]">QUESTIONS</span>
          </h2>
          <div className="w-24 h-1 bg-[#7303c0] mx-auto mb-8 clip-polygon"></div>
          <p className="text-[#928dab] text-lg">
            Got questions? We&apos;ve got answers. Everything you need to know about GEN 201.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-black/30 border border-[#7303c0] clip-polygon overflow-hidden backdrop-blur-sm">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#7303c0]/10 transition-colors duration-200"
              >
                <h3 className="font-orbitron font-bold text-lg pr-4 text-[#928dab]">{faq.question}</h3>
                <div className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-45' : ''}`}>
                  <div className="w-6 h-6 relative">
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-[#7303c0] transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-[#7303c0] transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-8 pb-6">
                  <div className="border-t border-[#7303c0]/30 pt-4">
                    <p className="text-[#928dab] leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}