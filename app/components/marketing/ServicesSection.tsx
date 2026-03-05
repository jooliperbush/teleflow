"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import FadeInView from "./FadeInView";
import Link from "next/link";

const services = [
  { id: "internet", iconSrc: "/icons/icon-internet.svg", label: "Internet", title: "Business grade broadband. Proactively managed not just delivered.",
    desc: "We monitor your connection around the clock — most faults are resolved before you notice them. Registered ISP, so no middleman, no excuses.",
    features: ["Full fibre from 115 Mbps to 1 Gbps", "Managed installation with business SLA", "Unlimited usage, no throttling, no fair use catches"],
    cta: { label: "Check availability at your postcode", href: "/order" } },
  { id: "voip", iconSrc: "/icons/icon-voip.svg", label: "VoIP", title: "Talk with Freedom",
    desc: "Cloud-based telephony that scales with your business. Enjoy 99.99% uptime and crystal-clear communication.",
    features: ["99.99% Uptime", "24/7 Support", "Scalable"] },
  { id: "mobile", iconSrc: "/icons/icon-mobile.svg", label: "Mobile", title: "Stay Connected Anywhere",
    desc: "Customised mobile plans across major networks, ensuring your team stays productive on the go.",
    features: ["99.99% Uptime", "24/7 Support", "Scalable"] },
  { id: "migration", iconSrc: "/icons/icon-landline.svg", label: "Landline Migration Review", title: "Still using PSTN or ISDN? The 2027 switchoff is coming.",
    desc: "Openreach is phasing out legacy copper-based services. We'll assess your current setup and recommend the right future-proof solution.",
    features: ["Full audit of your current lines", "Availability check for fibre or Ethernet", "Clear installation timeline"] },
];

export default function ServicesSection() {
  const [active, setActive] = useState(0);
  return (
    <section id="services" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(252,92%,10%) 0%, hsl(260,80%,12%) 100%)" }}>
      <div className="max-w-7xl mx-auto relative">
        <FadeInView>
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white"
              style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              What We <br />
              <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Offer</span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
              A complete suite of communication solutions designed to keep your organisation seamlessly connected.
            </p>
            <a
              href="/ITC-Services-Brochure.pdf"
              download="ITC-Services-Brochure.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f94580, #591bff)', boxShadow: '0 4px 20px rgba(249,69,128,0.25)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Our Services Brochure
            </a>
          </div>
        </FadeInView>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-4">
            {services.map((s, i) => {

              return (
                <button key={s.id} onClick={() => setActive(i)}
                  className={`text-left p-3 lg:p-8 rounded-xl lg:rounded-[2rem] transition-all duration-500 flex items-center gap-2 lg:gap-5 lg:justify-between group lg:w-full ${active === i ? "bg-white text-black shadow-2xl" : "bg-white/5 hover:bg-white/10 text-white"}`}>
                  <div className="flex items-center gap-2 lg:gap-5">
                    <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-2xl flex items-center justify-center shrink-0 ${active === i ? "bg-[#f94580]/20" : "bg-white/10"}`}>
                      <img src={s.iconSrc} alt={s.label} className="w-5 h-5 lg:w-7 lg:h-7" />
                    </div>
                    <span className="text-sm lg:text-xl font-bold whitespace-nowrap">{s.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform hidden lg:block ${active === i ? "rotate-90" : "group-hover:translate-x-1"}`} />
                </button>
              );
            })}
          </div>
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-10 h-full flex flex-col justify-between relative overflow-hidden">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                    {services[active].title}
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-8">{services[active].desc}</p>
                  <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#f94580] mb-4">Key Features</p>
                    <div className="space-y-3">
                      {services[active].features.map((f) => (
                        <div key={f} className="flex items-start gap-3 text-white">
                          <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Link href={(services[active] as {cta?: {href: string}}).cta?.href ?? "/order"} className="inline-flex items-center gap-2 text-[#f94580] font-bold hover:gap-3 transition-all">
                  {(services[active] as {cta?: {label: string}}).cta?.label ?? "Get a Quote"} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
