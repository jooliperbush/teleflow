"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import FadeInView from "./FadeInView";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 px-6 md:px-20"
      style={{ background: "linear-gradient(135deg, hsl(252,92%,10%) 0%, hsl(260,80%,12%) 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(to right, #f94580, #591bff, #7be7ff)" }} />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none hidden md:block"
        style={{ background: "rgba(89,27,255,0.1)", filter: "blur(100px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none hidden md:block"
        style={{ background: "rgba(249,69,128,0.08)", filter: "blur(120px)", animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <FadeInView>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-8 bg-[#f94580]/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#f94580] animate-pulse" />
            Trusted by 2,000+ UK Businesses
          </div>
        </FadeInView>
        <FadeInView delay={0.1}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
            Connectivity{" "}<br />
            <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Without the
            </span><br />
            Complexity
          </h1>
        </FadeInView>
        <FadeInView delay={0.2}>
          <p className="text-lg text-white/60 max-w-md mb-4 leading-relaxed">
            Over 20 years providing the best in VoIP, Business Internet, Mobile and SaaS.
          </p>
          <p className="text-lg text-white/75 max-w-md mb-10 leading-relaxed font-semibold">
            One partner. One bill. Real support.
          </p>
        </FadeInView>
        <FadeInView delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/order"
              className="inline-flex items-center gap-3 px-8 py-5 rounded-full font-bold text-lg text-white hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>
              Start Onboarding <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#services"
              className="inline-flex items-center gap-3 px-8 py-5 rounded-full font-bold text-lg text-white/80 border border-white/20 hover:bg-white/5 transition-colors">
              Explore Services
            </a>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
