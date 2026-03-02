"use client";
import { Zap } from "lucide-react";
import FadeInView from "./FadeInView";

const reasons = [
  { title: "Personalised Support", desc: "Dedicated account managers who understand each client's needs." },
  { title: "Speed of Service", desc: "Fast response times to keep business running smoothly." },
  { title: "Proactive Solutions", desc: "Monitoring and future-proofing to stay ahead of technological changes." },
  { title: "Transparency & Value", desc: "Clear, fair pricing without hidden fees or surprises." },
];

export default function WhyITCSection() {
  return (
    <section id="why-itc" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden bg-white text-black">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "rgba(249,69,128,0.08)", filter: "blur(120px)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "rgba(123,231,255,0.08)", filter: "blur(120px)" }} />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FadeInView>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 md:mb-12" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
                Why Choose <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ITC?</span>
              </h2>
            </FadeInView>
            <div className="grid sm:grid-cols-2 gap-6">
              {reasons.map((item, i) => (
                <FadeInView key={item.title} delay={0.1 + i * 0.08}>
                  <div className="bg-white/60 backdrop-blur-md border border-black/10 rounded-[2rem] p-8 hover:bg-white/80 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1" style={{ background: "rgba(249,69,128,0.1)" }}>
                        <Zap className="w-5 h-5 text-[#f94580]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg mb-2">{item.title}</p>
                        <p className="text-sm text-black/60 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
          <FadeInView delay={0.3}>
            <div className="bg-white/60 backdrop-blur-md border border-black/10 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(123,231,255,0.2)" }}>
                <Zap className="w-10 h-10 text-[#7be7ff]" />
              </div>
              <p className="text-6xl font-black mb-2" style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>99.99%</p>
              <p className="text-black/60 font-medium">Uptime Guarantee</p>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
