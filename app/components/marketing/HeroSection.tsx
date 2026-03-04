"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import FadeInView from "./FadeInView";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-24 px-5 md:px-20">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover object-center" />
        {/* Mobile: stronger top/left overlay for readability; desktop: gradient left→right */}
        <div className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(160deg, rgba(8,4,25,0.75) 0%, rgba(8,4,25,0.55) 60%, rgba(8,4,25,0.20) 100%)" }} />
        <div className="absolute inset-0 hidden md:block"
          style={{ background: "linear-gradient(to right, rgba(8,4,25,0.40) 0%, rgba(8,4,25,0.28) 50%, rgba(8,4,25,0.05) 100%)" }} />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px z-10"
          style={{ background: "linear-gradient(to right, transparent, #f94580, #591bff, #7be7ff, transparent)" }} />
      </div>

      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none hidden md:block z-0"
        style={{ background: "radial-gradient(circle, rgba(89,27,255,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <FadeInView>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6 md:mb-8 px-3 py-1.5 md:px-4 md:py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(12px)" }}>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/70 animate-pulse" />
            Trusted by 2,000+ UK Businesses
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tighter mb-6 md:mb-8 text-white"
            style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif", textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}>
            VoIP, Broadband,{" "}<br />
            <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(249,69,128,0.6))" }}>
              Mobile -
            </span><br />
            One Partner.
          </h1>
        </FadeInView>

        <FadeInView delay={0.2}>
          <p className="text-base md:text-lg text-white max-w-md mb-2 md:mb-3 leading-relaxed"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            Over 20 years providing the best in VoIP, Business Internet, Mobile and SaaS.
          </p>
          <p className="text-base md:text-lg text-white font-semibold max-w-md mb-8 md:mb-10 leading-relaxed"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}>
            One partner. One bill. Real support.
          </p>
        </FadeInView>

        <FadeInView delay={0.3}>
          {/* Stack vertically on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }} className="w-full sm:w-auto">
              <Link href="/order"
                className="flex items-center justify-center gap-3 px-7 py-4 rounded-full font-bold text-base text-white w-full sm:w-auto group"
                style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 30px rgba(249,69,128,0.4), 0 8px 32px rgba(89,27,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                Get a Free Quote <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }} className="w-full sm:w-auto">
              <a href="#services"
                className="flex items-center justify-center gap-3 px-7 py-4 rounded-full font-bold text-base text-white/90 w-full sm:w-auto"
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
