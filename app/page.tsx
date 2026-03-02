import MarketingNavbar from "./components/marketing/MarketingNavbar";
import HeroSection from "./components/marketing/HeroSection";
import ProofBar from "./components/marketing/ProofBar";
import ServicesSection from "./components/marketing/ServicesSection";
import WhyITCSection from "./components/marketing/WhyITCSection";
import FounderQuote from "./components/marketing/FounderQuote";
import ContactSection from "./components/marketing/ContactSection";
import MarketingFooter from "./components/marketing/MarketingFooter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <HeroSection />
      <ProofBar />
      <ServicesSection />
      <WhyITCSection />
      <FounderQuote />
      <ContactSection />
      <MarketingFooter />
    </div>
  );
}
