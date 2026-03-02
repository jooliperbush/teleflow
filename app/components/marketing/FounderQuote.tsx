"use client";
import { Quote } from "lucide-react";
import FadeInView from "./FadeInView";

export default function FounderQuote() {
  return (
    <section id="about" className="py-20 md:py-32 px-6 md:px-20 relative overflow-hidden bg-white text-black">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "rgba(249,69,128,0.08)", filter: "blur(120px)" }} />
      <div className="max-w-7xl mx-auto relative z-10">
        <FadeInView>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-12 md:mb-16" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
            About <span style={{ backgroundImage: "linear-gradient(to right, #f94580, #591bff, #7be7ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Us</span>
          </h2>
        </FadeInView>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <FadeInView>
            <div className="bg-white/60 backdrop-blur-md border border-black/10 rounded-[2rem] p-8 md:p-12 relative">
              <Quote className="w-12 h-12 mb-6" style={{ color: "rgba(249,69,128,0.3)" }} />
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug mb-8">
                "My goal has always been to simplify telecommunications with flexible, agile solutions and unmatched service."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: "linear-gradient(135deg, #f94580, #591bff)" }}>N</div>
                <div>
                  <p className="font-bold">Nasar Hussain</p>
                  <p className="text-sm text-black/60">Director and Founder of ITC</p>
                </div>
              </div>
            </div>
          </FadeInView>
          <FadeInView delay={0.2}>
            <div className="space-y-6">
              <p className="text-lg text-black/60 leading-relaxed">Over two decades, we've built a team of experienced, energetic professionals who embody trustworthiness, loyalty, and a passion for getting the job done.</p>
              <p className="text-lg text-black/60 leading-relaxed">We've also developed strong relationships with tier one service providers who share our values and strategic vision.</p>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
