"use client";
import { motion } from "framer-motion";
import FadeInView from "./FadeInView";

const timeline = [
  { short: "06", year: "2006", label: "Founded in Bradford", desc: "Started as a voice and data reseller built on transparent pricing and genuine local support.", color: "#f94580" },
  { short: "12", year: "2012", label: "Moved into hosted VoIP", desc: "Adopted cloud telephony years before most competitors — delivering better systems at lower cost.", color: "#8b5cf6" },
  { short: "18", year: "2018", label: "Registered ISP", desc: "Now supply broadband directly — removing third-party margin and giving clients faster fault resolution.", color: "#7be7ff" },
  { short: "27", year: "2023", label: "PSTN programme launched", desc: "Proactively contacted every client about the 2027 switch-off three years before the deadline hit.", color: "#34d399" },
]

const differentiators = [
  { icon: "🏆", title: "Genuinely independent", desc: "Not owned by BT, Vodafone, or any carrier. Our only incentive is keeping your business — so we recommend what's right for you, not what pays us best." },
  { icon: "🔧", title: "Engineers, not just resellers", desc: "We install, configure, and maintain. When something breaks, our engineers fix it — no ticket handoffs to a carrier's third-party contractor." },
  { icon: "👤", title: "Named account manager", desc: "Same person every time. Someone who knows your setup, your contracts, and your renewal dates — not a different agent every call." },
  { icon: "📋", title: "Ofcom registered · Ombudsman approved", desc: "Fully regulated with a formal escalation route if we ever fall short. No auto-renewal traps. No price-hike clauses in small print." },
]

export default function WhyITCSection() {
  return (
    <section id="why-itc" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, hsl(252,92%,8%) 0%, hsl(260,80%,11%) 100%)" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(249,69,128,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,231,255,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Top: intro left + timeline right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">

          {/* Left — intro */}
          <FadeInView>
            <p className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>About <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Us</span></p>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "#f94580" }} />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f94580]">Est. 2006 · Bradford</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight text-white"
              style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Two decades of independent telecoms — never bought, never compromised.
            </h2>
            <p className="text-white/55 text-lg leading-relaxed">
              ITC was founded in Bradford in 2006 to give UK businesses an honest alternative to the big carriers. We&apos;re still independently owned, still in Bradford, and still operating on the same principle: give people the right solution, not the most profitable one.
            </p>
          </FadeInView>

          {/* Right — vertical timeline */}
          <FadeInView delay={0.15}>
            <div className="relative">
              <div className="absolute left-[27px] top-8 bottom-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="space-y-8">
                {timeline.map((t) => (
                  <div key={t.year} className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg relative z-10"
                      style={{ border: `2px solid ${t.color}`, background: `${t.color}18`, color: t.color, fontFamily: "'Visby CF', sans-serif" }}>
                      {t.short}
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: t.color }}>
                        {t.year} — {t.label}
                      </p>
                      <p className="text-white/55 text-sm leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>
        </div>

        <div className="w-full h-px mb-16" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* 2000+ stat */}
        <FadeInView delay={0.1}>
          <div className="rounded-2xl px-8 py-6 mb-14 flex flex-col sm:flex-row items-center gap-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-5xl font-black flex-shrink-0"
              style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', sans-serif" }}>
              2,000+
            </p>
            <p className="text-white/55 text-base leading-relaxed">
              UK businesses connected since 2006 — from Bradford sole traders to multi-site enterprises nationwide. Here&apos;s what sets us apart from the carriers and the resellers that answer to them.
            </p>
          </div>
        </FadeInView>

        {/* Differentiators */}
        <div className="grid sm:grid-cols-2 gap-4">
          {differentiators.map((item, i) => (
            <FadeInView key={item.title} delay={0.1 + i * 0.08}>
              <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-[1.5rem] p-7 h-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-bold text-base mb-1.5 text-white">{item.title}</p>
                    <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            </FadeInView>
          ))}
        </div>

      </div>
    </section>
  );
}
