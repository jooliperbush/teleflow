"use client";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import FadeInView from "./FadeInView";

const reasons = [
  { title: "Personalised Support", desc: "Dedicated account managers who understand each client's needs." },
  { title: "Speed of Service", desc: "Fast response times to keep business running smoothly." },
  { title: "Proactive Solutions", desc: "Monitoring and future-proofing to stay ahead of technological changes." },
  { title: "Transparency & Value", desc: "Clear, fair pricing without hidden fees or surprises." },
];

export default function WhyITCSection() {
  return (
    <section id="why-itc" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, hsl(252,92%,8%) 0%, hsl(260,80%,11%) 100%)" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(249,69,128,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,231,255,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FadeInView>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 md:mb-12"
                style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                Why do Organisations <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choose ITC?</span>
              </h2>
            </FadeInView>
            <div className="grid sm:grid-cols-2 gap-4">
              {reasons.map((item, i) => (
                <FadeInView key={item.title} delay={0.1 + i * 0.08}>
                  <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="rounded-[1.5rem] p-7 h-full"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.15)"
                    }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(249,69,128,0.15)", border: "1px solid rgba(249,69,128,0.2)" }}>
                        <Zap className="w-5 h-5 text-[#f94580]" />
                      </div>
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

          <FadeInView delay={0.3}>
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-[2rem] p-10 flex flex-col items-center justify-center text-center h-full"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.2)"
              }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(123,231,255,0.12)", border: "1px solid rgba(123,231,255,0.2)" }}>
                <Zap className="w-10 h-10 text-[#7be7ff]" />
              </div>
              <p className="text-6xl font-black mb-2"
                style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                99.99%
              </p>
              <p className="text-white/50 font-medium mt-1">Uptime Guarantee</p>
            </motion.div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
