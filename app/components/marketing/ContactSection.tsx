"use client";
import { PhoneCall, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import FadeInView from "./FadeInView";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden"
      style={{ background: "#fff" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(249,69,128,0.3), rgba(89,27,255,0.3), transparent)" }} />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(89,27,255,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <FadeInView>
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-gray-900"
                style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                Ready to <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Talk?</span>
              </h2>
              <div className="space-y-5 mb-10">
                {[
                  { icon: PhoneCall, color: "#f94580", label: "Call our team", value: "01274 952 123", bg: "rgba(249,69,128,0.12)", border: "rgba(249,69,128,0.2)" },
                  { icon: Mail, color: "#7be7ff", label: "Email us", value: "connect@clickitc.co.uk", bg: "rgba(123,231,255,0.12)", border: "rgba(123,231,255,0.2)" },
                ].map((item) => (
                  <motion.div key={item.label} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: item.bg, border: `1px solid ${item.border}`, backdropFilter: "blur(10px)" }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Link href="/order"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 30px rgba(249,69,128,0.35), 0 8px 32px rgba(89,27,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                  Request a Callback
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </FadeInView>

          <FadeInView delay={0.2}>
            <form onSubmit={(e) => e.preventDefault()}
              className="rounded-[2rem] p-8 sm:p-10 space-y-5 bg-gray-50 border border-gray-100"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(24px)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.2)" }}>
              <div className="grid sm:grid-cols-2 gap-5">
                {["Name", "Email"].map((label) => (
                  <div key={label} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
                    <input type={label === "Email" ? "email" : "text"} placeholder={label === "Email" ? "you@company.com" : "Your name"}
                      className="w-full px-5 py-3.5 rounded-xl text-gray-900 text-sm placeholder-gray-300 focus:outline-none transition-all bg-white border border-gray-200"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => e.target.style.border = "1px solid rgba(249,69,128,0.5)"}
                      onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message</label>
                <textarea rows={5} placeholder="Tell us about your communication needs..."
                  className="w-full px-5 py-3.5 rounded-xl text-white text-sm placeholder-gray-300 focus:outline-none text-gray-900 transition-all resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => e.target.style.border = "1px solid rgba(249,69,128,0.5)"}
                  onBlur={(e) => e.target.style.border = "1px solid rgba(255,255,255,0.08)"} />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-full py-4 rounded-full font-bold text-base text-white"
                style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 24px rgba(249,69,128,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                Send Message
              </motion.button>
            </form>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
