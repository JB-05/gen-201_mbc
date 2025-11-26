'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:gen201hackathon@mbcpeermade.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return (
    <section id="contact" className="py-20 bg-black/95">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6 tracking-wider">
            GET IN <span className="text-[#928dab]">TOUCH</span>
          </h2>
          <div className="w-24 h-1 bg-[#7303c0] mx-auto mb-8 clip-polygon"></div>
          <p className="text-[#928dab] text-lg">
            Have questions? Ready to join the revolution? Let&apos;s connect.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="space-y-8">
              <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-6 clip-polygon">
                <h3 className="font-orbitron font-bold text-xl mb-4 text-[#7303c0]">EVENT DETAILS</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">LOCATION</div>
                    <div className="text-[#928dab]">Main Campus</div>
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">DATE & TIME</div>
                    <div className="text-[#928dab]">October 10-11, 2025<br />24 Hours</div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-6 clip-polygon">
                <h3 className="font-orbitron font-bold text-xl mb-4 text-[#7303c0]">CONTACT INFO</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">EMAIL</div>
                    <div className="text-[#928dab]">gen201hackathon@mbcpeermade.com</div>
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-sm text-[#7303c0] mb-1">PHONE</div>
                    <div>Noel Biju :</div>
                    <div className="text-[#928dab]">+91 88482 58798</div>
                    <div>Selma Anna Saju :</div>
                    <div className="text-[#928dab]">+91 88482 44807</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-8 clip-polygon h-full">
              <h3 className="font-orbitron font-bold text-xl mb-6 text-[#7303c0]">QUICK MESSAGE</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="YOUR NAME"
                      className="w-full bg-black/50 border border-[#7303c0] p-3 clip-polygon focus:border-[#928dab] focus:outline-none text-white placeholder-[#928dab]/50"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="YOUR EMAIL"
                      className="w-full bg-black/50 border border-[#7303c0] p-3 clip-polygon focus:border-[#928dab] focus:outline-none text-white placeholder-[#928dab]/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="SUBJECT"
                    className="w-full bg-black/50 border border-[#7303c0] p-3 clip-polygon focus:border-[#928dab] focus:outline-none text-white placeholder-[#928dab]/50"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="YOUR MESSAGE"
                    className="w-full bg-black/50 border border-[#7303c0] p-3 clip-polygon focus:border-[#928dab] focus:outline-none text-white placeholder-[#928dab]/50 resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#7303c0] text-white py-3 clip-polygon font-orbitron font-bold hover:bg-[#928dab] transition-colors duration-200"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="mt-12">
          <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 clip-polygon">
            <div className="aspect-video w-full overflow-hidden">
              <iframe 
                width="100%" 
                height="100%"
                src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Mar%20baseilos%20christian%20college%20of%20engineering%20and%20technology,%20Peermade,%20Kuttikkanam,%20Kerala%20685531+(Mar%20Baselios%20Christian%20College)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                className="w-full h-full"
                title="MBCCET Location Map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}