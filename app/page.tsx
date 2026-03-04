import MarketingNavbar from "./components/marketing/MarketingNavbar";
import PSTNCountdown from "./components/marketing/PSTNCountdown";
import HeroSection from "./components/marketing/HeroSection";
import ProofBar from "./components/marketing/ProofBar";
import ServicesSection from "./components/marketing/ServicesSection";
import InvoiceAnalyser from "./components/marketing/InvoiceAnalyser";
import WhyITCSection from "./components/marketing/WhyITCSection";
import FounderQuote from "./components/marketing/FounderQuote";
import ContactSection from "./components/marketing/ContactSection";
import MarketingFooter from "./components/marketing/MarketingFooter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50"><PSTNCountdown /><MarketingNavbar /></div>
      <HeroSection />
      <ProofBar />
      <ServicesSection />
      <InvoiceAnalyser />
      <WhyITCSection />
      <FounderQuote />
      <ContactSection />
      <MarketingFooter />
    </div>
  );
}
