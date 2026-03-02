"use client";
import { PhoneCall, Mail } from "lucide-react";
import FadeInView from "./FadeInView";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(252,92%,10%) 0%, hsl(260,80%,12%) 100%)" }}>
      <div className="max-w-7xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <FadeInView>
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                Ready to <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Talk?</span>
              </h2>
              <div className="space-y-8 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(249,69,128,0.2)" }}>
                    <PhoneCall className="w-6 h-6 text-[#f94580]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/40">Call our team</p>
                    <p className="text-xl font-bold text-white">01274 952 123</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(123,231,255,0.2)" }}>
                    <Mail className="w-6 h-6 text-[#7be7ff]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/40">Email us</p>
                    <p className="text-xl font-bold text-white">connect@clickitc.co.uk</p>
                  </div>
                </div>
              </div>
              <Link href="/order"
                className="inline-flex items-center gap-3 px-8 py-5 rounded-full font-bold text-lg text-white hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>
                Start Onboarding →
              </Link>
            </div>
          </FadeInView>
          <FadeInView delay={0.2}>
            <form onSubmit={(e) => e.preventDefault()} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-10 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/40">Name</label>
                  <input type="text" placeholder="Your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f94580]/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/40">Email</label>
                  <input type="email" placeholder="you@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f94580]/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/40">Message</label>
                <textarea rows={5} placeholder="Tell us about your communication needs..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f94580]/50 transition-all resize-none" />
              </div>
              <button type="submit"
                className="w-full py-5 rounded-full font-bold text-lg text-white hover:scale-[1.02] transition-all"
                style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>
                Send Message
              </button>
            </form>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
