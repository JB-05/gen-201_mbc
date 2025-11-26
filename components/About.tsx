export default function About() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6 tracking-wider">
            ABOUT <span className="text-[#928dab]">GEN 201</span>
          </h2>
          <div className="w-24 h-1 bg-[#7303c0] mx-auto mb-8 clip-polygon"></div>
        </div>
        
        <div className="bg-black/30 border border-[#7303c0] p-8 md:p-12 clip-polygon relative backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-orbitron font-bold text-2xl mb-4 text-[#7303c0]">THE CHALLENGE</h3>
              <p className="text-[#928dab] leading-relaxed mb-6">
                GEN 201 is not just another hackathon—it&apos;s a battleground where the brightest minds converge to architect the future. Over 24 intense hours, participants will push the boundaries of innovation, creating solutions that will define tomorrow&apos;s technological landscape.
              </p>
              <p className="text-[#928dab] leading-relaxed">
                This is your chance to collaborate with like-minded visionaries, learn from industry experts, and transform abstract ideas into tangible reality.
              </p>
            </div>
            
            <div>
              <h3 className="font-orbitron font-bold text-2xl mb-4 text-[#7303c0]">ORGANIZED BY</h3>
              <div className="bg-black/30 border border-[#7303c0] p-6 clip-polygon mb-6 backdrop-blur-sm">
                <h4 className="font-orbitron font-bold text-lg mb-2 text-[#928dab]">AI DEPARTMENT</h4>
                <p className="text-[#928dab] text-sm">
                  Leading the charge in artificial intelligence education and innovation, fostering the next generation of tech pioneers.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-[#928dab]">
                  <div className="w-2 h-2 bg-[#7303c0] mr-3 clip-polygon"></div>
                  <span>24-hour intensive marathon</span>
                </div>
                <div className="flex items-center text-[#928dab]">
                  <div className="w-2 h-2 bg-[#7303c0] mr-3 clip-polygon"></div>
                  <span>Team collaboration</span>
                </div>
                <div className="flex items-center text-[#928dab]">
                  <div className="w-2 h-2 bg-[#7303c0] mr-3 clip-polygon"></div>
                  <span>Industry mentor guidance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}