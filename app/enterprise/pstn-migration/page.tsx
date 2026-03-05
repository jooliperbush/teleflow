'use client'

import { useRef, useState, useEffect } from 'react'
import { ArrowRight, CheckCircle2, Phone, AlertTriangle, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar'
import MarketingFooter from '@/app/components/marketing/MarketingFooter'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={className} style={{ transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(24px)' }}>{children}</div>
}

function Countdown() {
  const target = new Date('2027-01-31T00:00:00Z').getTime()
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => { const diff = Math.max(0, target - Date.now()); setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) }) }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [target])
  const u = (val: number, l: string) => <div className="flex flex-col items-center"><span className="text-3xl md:text-5xl font-black tabular-nums text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>{String(val).padStart(2, '0')}</span><span className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">{l}</span></div>
  return <div className="flex items-center gap-5 md:gap-8 justify-center">{u(t.d, 'Days')}<span className="text-2xl font-black text-white/20 mb-4">:</span>{u(t.h, 'Hrs')}<span className="text-2xl font-black text-white/20 mb-4">:</span>{u(t.m, 'Min')}<span className="text-2xl font-black text-white/20 mb-4">:</span>{u(t.s, 'Sec')}</div>
}

const faqs = [
  { q: 'What is the PSTN switch-off date?', a: 'BT Openreach will permanently switch off the Public Switched Telephone Network (PSTN) and ISDN on 31 January 2027. After this date, any services that rely on these legacy copper-based lines — including phone systems, alarm diallers, lift phones, and EPOS terminals — will stop working.' },
  { q: 'How do I migrate from ISDN?', a: 'ISDN migration typically involves replacing your existing PBX or phone system with a cloud-based VoIP platform (also called hosted telephony). ITC conducts a full estate audit to identify every ISDN line across your sites, maps them to the right replacement solution, and manages the cutover without disrupting your live services.' },
  { q: 'Will my fire alarm and lift phone be affected by the PSTN switch-off?', a: 'Yes. Fire alarm auto-diallers, lift emergency phones, CCTV systems, and payment terminals that use analogue or ISDN lines will all be affected. ITC\'s estate audit specifically covers these non-voice lines, and we provide approved alternatives for each.' },
  { q: 'How long does a PSTN migration take for a multi-site organisation?', a: 'Timeline depends on the size of your estate and the complexity of existing infrastructure. A single-site business might complete migration in 4–6 weeks. Multi-site organisations typically require 3–6 months for full planning, procurement, and phased cutover. Starting now gives you the time to do it properly.' },
  { q: 'What is the difference between PSTN and VoIP?', a: 'PSTN (Public Switched Telephone Network) routes calls over physical copper wires. VoIP (Voice over Internet Protocol) routes calls digitally over your internet connection. VoIP is more flexible, supports remote and mobile working, and is fully compatible with the post-2027 network infrastructure.' },
  { q: 'Can ITC manage the PSTN migration for multiple sites simultaneously?', a: 'Yes. ITC has experience managing concurrent migrations across multi-site estates. We assign a dedicated project manager to coordinate each site, stagger cutovers to avoid risk, and maintain your existing services until each migration is complete and tested.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((f, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="w-full text-left px-6 py-5 flex items-center justify-between gap-4" onClick={() => setOpen(open === i ? null : i)}>
            <span className="font-bold text-white text-sm md:text-base" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>{f.q}</span>
            <ChevronDown className={`w-5 h-5 text-[#f94580] shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <div className="px-6 pb-5 text-white/65 text-sm leading-relaxed">{f.a}</div>}
        </div>
      ))}
    </div>
  )
}

export default function PSTNMigrationPage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(252, 92%, 10%)' }}>
      <MarketingNavbar />

      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-32 pb-20 px-5 md:px-20">
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="" fill className="object-cover object-center opacity-20" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(8,4,25,0.95) 0%, rgba(8,4,25,0.80) 100%)' }} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(249,69,128,0.12)', border: '1px solid rgba(249,69,128,0.3)' }}>
              <AlertTriangle className="w-3.5 h-3.5" /> PSTN Switch-Off: 31 January 2027
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.92] tracking-tighter mb-6 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              PSTN Migration for<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                UK Enterprise Organisations
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              BT Openreach is permanently switching off the PSTN and ISDN network on 31 January 2027. ITC manages the full migration — from estate audit across every site to final cutover — with zero disruption to live services.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mb-10"><Countdown /></div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
                style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4)' }}>
                Book a free estate audit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="tel:01274952123" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white/90"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Phone className="w-4 h-4" /> 01274 952 123
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHAT'S AFFECTED */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              It's not just your phones.<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything on your copper lines stops.</span>
            </h2>
            <p className="text-white/65 leading-relaxed">For multi-site organisations, the impact of the PSTN switch-off goes far beyond desk phones. Every service running over a copper or ISDN line needs to be identified, audited, and migrated before 31 January 2027.</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {['Phone systems & PBX', 'Fire alarm auto-diallers', 'Lift emergency phones', 'CCTV lines', 'EPOS & payment terminals', 'Door access systems', 'ISDN data lines', 'Fax machines'].map(item => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(249,69,128,0.08)', border: '1px solid rgba(249,69,128,0.15)' }}>
                  <AlertTriangle className="w-4 h-4 text-[#f94580] shrink-0" />
                  <span className="text-white/80 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              How we manage your migration
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto">A structured, risk-managed process from audit to go-live. No surprises.</p>
          </FadeIn>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Estate Audit', body: 'Free site-by-site audit of every line, device, and service across your estate — voice and non-voice.' },
              { n: '02', title: 'Migration Plan', body: 'A detailed plan covering each site, recommended solution, timeline, and fixed-price costs. No ambiguity.' },
              { n: '03', title: 'Phased Delivery', body: 'Cutovers are staggered by site. Your existing services stay live until each migration is complete and tested.' },
              { n: '04', title: 'Post-Migration Support', body: 'Named engineer support post-cutover. We don\'t disappear after go-live — your account manager stays.' },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1}>
                <div className="rounded-2xl p-6 h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-4xl font-black mb-4" style={{ backgroundImage: 'linear-gradient(135deg, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Manrope', sans-serif" }}>{s.n}</div>
                  <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>{s.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)' }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>What's included in ITC's PSTN migration service</h2>
          </FadeIn>
          <FadeIn>
            <div className="space-y-3">
              {['Full site-by-site estate audit — free of charge', 'Migration planning across voice, alarms, lifts, and EPOS', 'Direct Openreach engineering support for complex sites', 'No disruption to live services during cutover', 'Fixed-price migration packages available', 'Microsoft Teams Direct Routing where required', 'Post-migration support with named account manager'].map(b => (
                <div key={b} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              PSTN migration — common questions
            </h2>
            <p className="text-white/55">Everything multi-site organisations ask us before starting.</p>
          </FadeIn>
          <FadeIn><FAQ /></FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-5 md:px-20 text-center" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>The deadline doesn't move. Your plan should.</h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto mb-10">Book a free estate audit today. No obligation — just a clear picture of what needs to move and when.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
              style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.35)' }}>
              Book a free estate audit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/enterprise" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white/80"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              ← Back to Enterprise
            </Link>
          </div>
        </FadeIn>
      </section>

      <MarketingFooter />
    </div>
  )
}
