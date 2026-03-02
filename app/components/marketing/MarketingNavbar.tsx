"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Why ITC", href: "#why-itc" },
  { label: "Check Availability", href: "#contact" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-20 py-5 backdrop-blur-xl border-b border-white/5 transition-colors duration-300"
        style={{ backgroundColor: scrolled ? "rgba(255,255,255,0.82)" : "hsl(252 92% 14% / 0.8)" }}
      >
        <Link href="/" className="flex items-center">
          <Image src="/itc-logo.svg" alt="ITC" width={120} height={40} className={scrolled ? "brightness-0" : ""} />
        </Link>
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}
              className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-black" : "text-white/60 hover:text-white"}`}>
              {item.label}
            </a>
          ))}
        </div>
        <Link href="/order"
          className="hidden md:flex items-center gap-2 bg-[#f94580] text-white px-6 py-3 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-transform">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl ${scrolled ? "bg-black/5 text-black" : "bg-white/5 text-white"}`}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-[hsl(252,92%,10%)]/95 backdrop-blur-2xl pt-24 px-6 flex flex-col gap-2 md:hidden">
            {navItems.map((item, i) => (
              <motion.a key={item.label} href={item.href}
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="text-2xl font-bold py-4 border-b border-white/5 text-white">
                {item.label}
              </motion.a>
            ))}
            <Link href="/order" onClick={() => setMobileOpen(false)}
              className="mt-6 flex items-center justify-center gap-2 bg-[#f94580] text-white px-8 py-5 rounded-full font-bold text-lg">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
