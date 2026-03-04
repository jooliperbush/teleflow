"use client";
import { motion } from "framer-motion";
import FadeInView from "./FadeInView";

const timeline = [
  { year: "2006", label: "Founded in Bradford", desc: "Started as a voice and data reseller built on transparent pricing and genuine local support." },
  { year: "2012", label: "Moved into hosted VoIP", desc: "Adopted cloud telephony years before most competitors — delivering better systems at lower cost." },
  { year: "2018", label: "Registered ISP", desc: "Now supply broadband directly — removing third-party margin and giving clients faster fault resolution." },
  { year: "2023", label: "PSTN programme launched", desc: "Proactively contacted every client about the 2027 switch-off three years before the deadline hit." },
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

        {/* Header */}
        <FadeInView>
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Est. 2006 · Bradford</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
            style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
            Why do Organisations <br />
            <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choose ITC?</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mb-16 leading-relaxed">
            Two decades of independent telecoms — never bought, never compromised. Founded in Bradford in 2006 to give UK businesses an honest alternative to the big carriers. Still independently owned, still in Bradford, still operating on the same principle: give people the right solution, not the most profitable one.
          </p>
        </FadeInView>

        {/* Timeline */}
        <FadeInView delay={0.1}>
          <div className="mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-8">Our story</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {timeline.map((t, i) => (
                <motion.div key={t.year} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
                  <p className="text-3xl font-black mb-2"
                    style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', sans-serif" }}>
                    {t.year}
                  </p>
                  <p className="font-bold text-sm text-white mb-1">{t.label}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInView>

        {/* Stat + intro */}
        <FadeInView delay={0.15}>
          <div className="rounded-2xl px-8 py-6 mb-14 flex flex-col sm:flex-row items-center gap-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-5xl font-black flex-shrink-0"
              style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', sans-serif" }}>
              2,000+
            </p>
            <p className="text-white/60 text-base leading-relaxed">
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
