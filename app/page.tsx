import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import StatsSection from '@/components/StatsSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-app">
      <Navbar />
      <Hero />
      <Features />
      <StatsSection />
      <Footer />
    </div>
  );
}
