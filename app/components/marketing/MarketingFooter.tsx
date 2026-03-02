"use client";
import Image from "next/image";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 py-12 md:py-20 px-6 md:px-20"
      style={{ background: "hsl(252,92%,10%)" }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
        <Image src="/itc-logo.svg" alt="ITC" width={120} height={40} />
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-bold uppercase tracking-widest text-white/20">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
        <p className="text-xs text-white/20 font-medium tracking-widest text-center">
          © 2026 ITC. CONNECTIVITY WITHOUT THE COMPLEXITY.
        </p>
      </div>
    </footer>
  );
}
