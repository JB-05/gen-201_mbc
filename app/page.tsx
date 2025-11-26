import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Timeline from '@/components/Timeline';
import Prizes from '@/components/Prizes';
import FAQ from '@/components/FAQ';
import Sponsors from '@/components/Sponsors';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <Navbar />
      <Hero /> {/* Black background from component */}
      <div className="bg-[#0a0a0a]">
        <About />
      </div>
      <div className="bg-black">
        <Prizes />
      </div>
      <div className="bg-[#0a0a0a]">
        <Timeline />
      </div>
      <div className="bg-black">
        <FAQ />
      </div>
      <div className="bg-[#0a0a0a]">
        <Sponsors />
      </div>
      <div className="bg-black">
        <Contact />
      </div>
      <Footer /> {/* Footer has its own background */}
    </main>
  );
}