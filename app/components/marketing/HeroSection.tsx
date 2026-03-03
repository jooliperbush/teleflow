"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import FadeInView from "./FadeInView";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 px-6 md:px-20">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover object-center" />
        {/* Dark overlay so text reads cleanly — stronger on left where text sits */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,4,25,0.72) 0%, rgba(8,4,25,0.50) 50%, rgba(8,4,25,0.15) 100%)" }} />
        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to bottom, transparent, hsl(252,92%,8%))" }} />
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px z-10" style={{ background: "linear-gradient(to right, transparent, #f94580, #591bff, #7be7ff, transparent)" }} />
      </div>

      {/* Subtle glow to complement the image colours */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none hidden md:block z-0"
        style={{ background: "radial-gradient(circle, rgba(89,27,255,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <FadeInView>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-8 px-4 py-2 rounded-full"
            style={{ background: "rgba(249,69,128,0.12)", border: "1px solid rgba(249,69,128,0.25)", backdropFilter: "blur(12px)" }}>
            <div className="w-2 h-2 rounded-full bg-[#f94580] animate-pulse" />
            Trusted by 2,000+ UK Businesses
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white drop-shadow-2xl"
            style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}>
            Connectivity{" "}<br />
            <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Without the
            </span><br />
            Complexity
          </h1>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-lg text-white/70 max-w-md mb-3 leading-relaxed" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            Over 20 years providing the best in VoIP, Business Internet, Mobile and SaaS.
          </p>
          <p className="text-lg text-white font-semibold max-w-md mb-10 leading-relaxed" style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            One partner. One bill. Real support.
          </p>
        </FadeInView>

        <FadeInView delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Link href="/order"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 30px rgba(249,69,128,0.4), 0 8px 32px rgba(89,27,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                <span className="relative z-10 flex items-center gap-3">
                  Start Onboarding <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <a href="#services"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white/90 transition-all"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(20px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                Explore Services
              </a>
            </motion.div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
