export default function Prizes() {
  const prizes = [
    {
      rank: '1ST',
      amount: '₹25,000',
      perks: ['Cash Prize', 'Winner Certificate',],
      highlight: true
    },
    {
      rank: '2ND',
      amount: '₹15,000',
      perks: ['Cash Prize', 'Certificate',],
      highlight: false
    },
    {
      rank: '3RD',
      amount: '₹10,000',
      perks: ['Cash Prize', 'Certificate'],
      highlight: false
    }
  ];

  return (
    <section id="prizes" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 tracking-wider">
            PRIZE <span className="text-[#928dab]">POOL</span>
          </h2>
          <div className="w-16 md:w-24 h-1 bg-[#7303c0] mx-auto mb-6 md:mb-8 clip-polygon"></div>
          <p className="text-[#928dab] text-base md:text-lg max-w-2xl mx-auto px-4 md:px-0">
            ₹50,000+ in total prizes awaiting innovative teams. Excellence will be rewarded.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 mb-12 relative">
          {/* First Prize - Always on top in mobile */}
          <div className="order-1 md:order-2 relative group md:col-span-1 transform scale-105 md:scale-110 z-10">
            <div className="bg-black/30 backdrop-blur-sm border-2 border-[#B8860B] p-6 md:p-8 clip-polygon relative transition-all duration-300 hover:border-[#DAA520] group-hover:bg-[#B8860B]/5 shadow-[0_0_15px_rgba(184,134,11,0.3)]">
              <div className="absolute -top-3 inset-x-0 mx-auto flex justify-center">
                <div className="bg-gradient-to-r from-[#B8860B] via-[#DAA520] to-[#B8860B] text-black px-4 md:px-6 pt-5 py-1 md:pt-2 clip-polygon text-xs md:text-sm font-orbitron font-bold">
                  CHAMPION
                </div>
              </div>
              <div className="text-center mb-4 md:mb-6 relative">
                <div className="font-orbitron font-black text-3xl md:text-4xl mb-2 md:mb-3 bg-gradient-to-r from-[#B8860B] via-[#DAA520] to-[#B8860B] text-transparent bg-clip-text">{prizes[0].rank}</div>
                <div className="font-orbitron font-bold text-2xl md:text-3xl text-[#DAA520]">{prizes[0].amount}</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {prizes[0].perks.map((perk, perkIndex) => (
                  <div key={perkIndex} className="flex items-center text-[#DAA520]">
                    <div className="w-2 h-2 bg-[#B8860B] mr-3 clip-polygon"></div>
                    <span className="text-xs md:text-sm">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Prize */}
          <div className="order-2 md:order-1 relative group">
            <div className="bg-black/30 backdrop-blur-sm border-2 border-[#C0C0C0] p-6 md:p-8 clip-polygon relative transition-all duration-300 hover:border-[#E8E8E8] group-hover:bg-[#C0C0C0]/5 shadow-[0_0_15px_rgba(192,192,192,0.3)]">
              <div className="text-center mb-4 md:mb-6">
                <div className="font-orbitron font-black text-2xl md:text-3xl mb-2 bg-gradient-to-r from-[#C0C0C0] via-[#E8E8E8] to-[#C0C0C0] text-transparent bg-clip-text">{prizes[1].rank}</div>
                <div className="font-orbitron font-bold text-xl md:text-2xl text-[#E8E8E8]">{prizes[1].amount}</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {prizes[1].perks.map((perk, perkIndex) => (
                  <div key={perkIndex} className="flex items-center text-[#E8E8E8]">
                    <div className="w-2 h-2 bg-[#C0C0C0] mr-3 clip-polygon"></div>
                    <span className="text-xs md:text-sm">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third Prize */}
          <div className="order-3 md:order-3 relative group">
            <div className="bg-black/30 backdrop-blur-sm border-2 border-[#CD7F32] p-6 md:p-8 clip-polygon relative transition-all duration-300 hover:border-[#DFA878] group-hover:bg-[#CD7F32]/5 shadow-[0_0_15px_rgba(205,127,50,0.3)]">
              <div className="text-center mb-4 md:mb-6">
                <div className="font-orbitron font-black text-2xl md:text-3xl mb-2 bg-gradient-to-r from-[#CD7F32] via-[#DFA878] to-[#CD7F32] text-transparent bg-clip-text">{prizes[2].rank}</div>
                <div className="font-orbitron font-bold text-xl md:text-2xl text-[#DFA878]">{prizes[2].amount}</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                {prizes[2].perks.map((perk, perkIndex) => (
                  <div key={perkIndex} className="flex items-center text-[#DFA878]">
                    <div className="w-2 h-2 bg-[#CD7F32] mr-3 clip-polygon"></div>
                    <span className="text-xs md:text-sm">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Rewards */}
        <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-6 md:p-8 clip-polygon">
          <div className="text-center mb-4 md:mb-6">
            <h3 className="font-orbitron font-bold text-xl md:text-2xl mb-3 md:mb-4 text-[#7303c0]">ADDITIONAL REWARDS</h3>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="bg-black/30 border border-[#7303c0] p-4 md:p-6 clip-polygon backdrop-blur-sm max-w-lg w-full">
              <h4 className="font-orbitron font-bold text-base md:text-lg mb-2 md:mb-3 text-[#928dab]">TOP TEAMS</h4>
              <p className="text-[#928dab] text-xs md:text-sm mb-3 md:mb-4">All top teams get certificates of participation.</p>
              <div className="flex items-center text-[#928dab]">
                <div className="w-2 h-2 bg-[#7303c0] mr-3 clip-polygon"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}