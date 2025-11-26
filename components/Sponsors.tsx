import Image from 'next/image';

export default function Sponsors() {
  const sponsors = [
    { name: 'Tech Corp', logo: 'https://images.pexels.com/photos/207580/pexels-photo-207580.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
    { name: 'Innovation Labs', logo: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
    { name: 'AI Solutions', logo: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
    { name: 'Digital Dynamics', logo: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
    { name: 'Future Systems', logo: 'https://images.pexels.com/photos/356043/pexels-photo-356043.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
    { name: 'Code Masters', logo: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop' },
  ];

  return (
    <section id="sponsors" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6 tracking-wider">
            POWERED BY <span className="text-[#928dab]">SPONSORS</span>
          </h2>
          <div className="w-24 h-1 bg-[#7303c0] mx-auto mb-8 clip-polygon"></div>
          <p className="text-[#928dab] text-lg max-w-2xl mx-auto">
            Industry leaders and innovators supporting the next generation of technological breakthroughs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="group">
              <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-6 clip-polygon hover:border-[#928dab] transition-all duration-300 relative overflow-hidden">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={200}
                  height={80}
                  className="w-full h-20 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7303c0]/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-8 clip-polygon">
            <h3 className="font-orbitron font-bold text-2xl mb-4 text-[#7303c0]">BECOME A SPONSOR</h3>
            <p className="text-[#928dab] mb-6">
              Join us in shaping the future. Partner with GEN 201 and connect with brilliant minds.
            </p>
            <a
              href="mailto:gen201hackathon@mbcpeermade.com"
              className="inline-block bg-[#7303c0] text-white px-6 py-3 clip-polygon font-orbitron font-bold hover:bg-[#928dab] transition-colors duration-200"
            >
              CONTACT US
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}