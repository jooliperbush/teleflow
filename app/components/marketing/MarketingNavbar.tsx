"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Why ITC", href: "#why-itc" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Invoice Analysis", href: "#invoice-analyser" },
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
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex items-center justify-between px-6 md:px-20 py-4 transition-all duration-500"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(15,8,40,0.7)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "0 4px 24px rgba(0,0,0,0.2)",
        }}>
        <Link href="/" className="flex items-center">
          <Image src={scrolled ? "/itc-logo-dark.svg?v=2" : "/itc-logo.svg?v=2"} alt="ITC" width={110} height={36} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const cls = `text-sm font-medium transition-colors duration-200 ${scrolled ? "hover:text-gray-900" : "text-white/55 hover:text-white"}`;
            const st = scrolled ? { color: '#374151' } : {};
            return item.href.startsWith('/') ? (
              <Link key={item.label} href={item.href} className={cls} style={st}>{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href} className={cls} style={st}>{item.label}</a>
            );
          })}
        </div>

        {/* Phone number */}
        <a href="tel:01274952123" className={`hidden md:flex items-center gap-2 text-sm font-semibold transition-colors ${scrolled ? "hover:text-gray-900" : "text-white/80 hover:text-white"}`}
          style={scrolled ? { color: '#111827' } : {}}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"/></svg>
          01274 952 123
        </a>

        {/* Apple-style pill button */}
        <motion.div className="hidden md:block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Link href="/order"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg, #f94580 0%, #591bff 100%)", boxShadow: "0 0 20px rgba(249,69,128,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            Get a Free Quote
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <button onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${scrolled ? "bg-black/5 text-black" : "bg-white/8 text-white"}`}
          style={{ backdropFilter: "blur(10px)" }}>
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 pt-20 px-6 flex flex-col gap-1 md:hidden"
            style={{ background: "rgba(10,5,30,0.96)", backdropFilter: "blur(24px)" }}>
            {navItems.map((item, i) => {
              const motionProps = { key: item.label, initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.05 } };
              const cls = "text-2xl font-bold py-4 border-b text-white block";
              const st = { borderColor: "rgba(255,255,255,0.06)" };
              return item.href.startsWith('/') ? (
                <motion.div {...motionProps}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)} className={cls} style={st}>{item.label}</Link>
                </motion.div>
              ) : (
                <motion.a {...motionProps} href={item.href} onClick={() => setMobileOpen(false)} className={cls} style={st}>{item.label}</motion.a>
              );
            })}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link href="/order" onClick={() => setMobileOpen(false)}
                className="mt-8 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg text-white"
                style={{ background: "linear-gradient(135deg, #f94580, #591bff)", boxShadow: "0 0 30px rgba(249,69,128,0.3)" }}>
                Get a Free Quote <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
