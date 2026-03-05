'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle2, Phone, Download, Mail, FileText, Shield, User, Receipt, Building2, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar'
import MarketingFooter from '@/app/components/marketing/MarketingFooter'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)' }}>
      {children}
    </div>
  )
}

function Countdown() {
  const target = new Date('2027-01-31T00:00:00Z').getTime()
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) })
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [target])
  const unit = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-6xl font-black tabular-nums text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>{String(val).padStart(2, '0')}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">{label}</span>
    </div>
  )
  return (
    <div className="flex items-center gap-6 md:gap-10 justify-center">
      {unit(t.d, 'Days')}<span className="text-3xl font-black text-white/20 mb-4">:</span>
      {unit(t.h, 'Hrs')}<span className="text-3xl font-black text-white/20 mb-4">:</span>
      {unit(t.m, 'Min')}<span className="text-3xl font-black text-white/20 mb-4">:</span>
      {unit(t.s, 'Sec')}
    </div>
  )
}

const trustBadges = ['Ofcom Registered', 'Ombudsman Approved', 'BT Openreach Partner', 'Gamma Partner', 'Official Supplier - Bradford UK City of Culture']

const services = [
  {
    tag: 'Internet & Connectivity',
    title: "Enterprise connectivity that's proactively managed, not just delivered.",
    body: "From dedicated leased lines to multi-site full fibre, we design and manage connectivity that meets your SLA requirements - not a generic business package with a business price tag. Proactive 24/7 monitoring means most faults are identified and escalated before you're aware of them.",
    bullets: ['Leased lines, FTTP, and EFM across all major UK carriers', 'Business SLA with guaranteed response and fix times', 'Proactive monitoring with named engineer escalation', 'Scalable from a single site to 100+ locations', 'Direct Openreach relationship for faster fault resolution'],
    cta: 'Check availability at your postcode', href: '/order',
    gradient: 'linear-gradient(135deg, #591bff 0%, #7be7ff 100%)',
  },
  {
    tag: 'Hosted VoIP & Unified Communications',
    title: 'Phone systems built for how enterprise teams actually work.',
    body: "Cloud-based telephony that works across desk phones, softphones, and mobiles - with call recording, IVR, hunt groups, and analytics included as standard. With the PSTN switching off in January 2027, we manage the migration from audit to go-live, across every site.",
    bullets: ['100% uptime SLA with fully redundant infrastructure', 'Unlimited UK calls across landlines and major mobile networks', 'Microsoft Teams Direct Routing available', 'Multi-site rollout with dedicated project management', "Full 2027 PSTN compliance - we've migrated 80% of our client base already"],
    cta: 'Get a VoIP quote', href: '/order',
    gradient: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)',
  },
  {
    tag: 'Mobile Fleet Management',
    title: 'One fleet. Multiple networks. Complete visibility.',
    body: "We're not tied to one network, so we put your team on the tariff that actually fits - across O2, Vodafone, EE, and Three. Fleet management portal, spend controls, and usage alerts give your operations team full visibility without the admin overhead.",
    bullets: ['Network-agnostic - we recommend based on coverage, not commission', 'Unlimited data, calls, and texts as standard', 'Hardware procurement and device management', 'Spend caps and usage alerts across the entire fleet', 'Consolidated onto your monthly ITC invoice'],
    cta: 'Talk to a mobile specialist', href: '/order',
    gradient: 'linear-gradient(135deg, #f94580 0%, #f9a030 100%)',
  },
  {
    tag: 'PSTN & ISDN Migration',
    title: 'The 2027 deadline isn\'t optional. We make the transition risk-free.',
    body: 'BT Openreach is switching off the PSTN and ISDN network on 31 January 2027. For multi-site organisations, that means every phone system, fire alarm dialler, lift phone, CCTV line, and payment terminal needs auditing and migrating. We manage the full process - from estate audit to final cutover.',
    bullets: ['Full site-by-site estate audit - free of charge', 'Migration planning across voice, alarms, lifts, and EPOS', 'Direct Openreach engineering support for complex sites', 'No disruption to live services during cutover', 'Fixed-price migration packages available'],
    cta: 'Book a free estate audit', href: '#contact',
    gradient: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)',
  },
]

const whyITC = [
  { icon: Shield, title: 'Independent and unbiased', body: "We're not owned by or financially tied to any single carrier. That means we recommend the right solution for your organisation - not the one that pays us the highest margin. Every recommendation comes with our reasoning, in plain English." },
  { icon: User, title: 'A named account manager who stays', body: 'Enterprise clients at large providers often cycle through account managers. At ITC, you have a named contact who knows your estate, your contracts, your renewal dates, and your escalation preferences. Same person. Direct line.' },
  { icon: Receipt, title: 'Transparent billing, always', body: "We've built an in-house billing audit capability because we know how often telecoms bills contain errors - and we apply the same rigour to our own invoicing. One consolidated monthly invoice, itemised and accurate." },
  { icon: Building2, title: 'Scale without losing the personal touch', body: 'We work with organisations from single-site SMEs to multi-location enterprises. The difference isn\'t a different product set - it\'s dedicated resource, senior account oversight, and SLAs that mean something.' },
]

const testimonials = [
  {
    quote: "The multi-site dedicated internet connectivity ensures seamless, high-speed access across all our locations. Their VoIP platform has streamlined collaboration for both office-based and remote teams. ITC's commitment to simplicity and reliability is evident in every interaction.",
    name: "Miriam O'Keeffe",
    role: "Operations Director - Bradford UK City of Culture",
    initials: "MO",
  },
]

export default function EnterprisePage() {
  const [form, setForm] = useState({ name: '', org: '', sites: '', need: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'hsl(252, 92%, 10%)' }}>
      <MarketingNavbar />

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 px-5 md:px-20">
        <div className="absolute inset-0 z-0">
          <Image src="/enterprise-hero.jpg" alt="" fill className="object-cover object-center" />
          <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(160deg, rgba(8,4,25,0.75) 0%, rgba(8,4,25,0.55) 60%, rgba(8,4,25,0.20) 100%)' }} />
          <div className="absolute inset-0 hidden md:block" style={{ background: 'linear-gradient(to right, rgba(8,4,25,0.60) 0%, rgba(8,4,25,0.40) 50%, rgba(8,4,25,0.15) 100%)' }} />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(89,27,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
              Enterprise Communications
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
              Enterprise telecoms.<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Without the runaround.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Multi-site connectivity, managed VoIP, mobile fleet, and PSTN migration - handled by a dedicated team who know your account. No call centres. No ticket queues. No carrier bias.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <a href="#contact" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
                style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                Speak to an enterprise specialist <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="/ITC-Services-Brochure.pdf" download className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white/90"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
                <Download className="w-4 h-4" /> Download our enterprise brochure
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              {trustBadges.map((b) => (
                <span key={b} className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#f94580] inline-block" />{b}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PULL QUOTE · WHITE ─────────────────── */}
      <section className="py-16 md:py-24 px-5 md:px-20" style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="w-12 h-1 mx-auto mb-8 rounded-full" style={{ background: 'linear-gradient(to right, #f94580, #591bff)' }} />
            <blockquote className="text-2xl md:text-4xl font-black tracking-tight leading-tight mb-8" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif", color: '#111827' }}>
              "ITC's commitment to simplicity, reliability, and doing the right thing is evident in every interaction."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f94580, #591bff)' }}>MO</div>
              <div className="text-left">
                <p className="font-semibold text-sm" style={{ color: '#111827' }}>Miriam O'Keeffe</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>Operations Director - Bradford UK City of Culture</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: 'hsl(252, 92%, 10%)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5">
              <span className="w-8 h-px bg-[#f94580]" /> The Problem
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
              The problem with most enterprise telecoms providers
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Most large providers offer enterprise-grade infrastructure - and a support experience that doesn't match it. Tickets go unanswered. Account managers change every six months. Billing errors take quarters to resolve. And when you escalate, you're told it's a carrier issue, not theirs.
            </p>
            <p className="text-white font-semibold text-lg leading-relaxed">
              ITC operates differently. We're independently owned, carrier-neutral, and structured so that every enterprise client has a named account manager with the authority to act - not just log a ticket.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── SERVICES · WHITE ───────────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: '#f8f9ff' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif", color: '#111827' }}>
              Everything your organisation needs.<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One partner, one invoice.</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
              We supply and manage the full communications stack for multi-site UK organisations - broadband, voice, mobile, and infrastructure - with a single point of accountability across all of it.
            </p>
          </FadeIn>
          <div className="space-y-8">
            {services.map((s, i) => (
              <FadeIn key={s.tag} delay={i * 0.08}>
                <div className="rounded-[2rem] p-8 md:p-12 grid md:grid-cols-2 gap-10 items-start bg-white" style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block text-[#f94580]">{s.tag}</span>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif", color: '#111827' }}>{s.title}</h3>
                    <p className="leading-relaxed mb-6" style={{ color: '#4b5563' }}>{s.body}</p>
                    <Link href={s.href.startsWith('/') ? s.href : '#contact'} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:opacity-90" style={{ background: s.gradient }}>
                      {s.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#f94580] mb-4">Included</p>
                    {s.bullets.map((b) => (
                      <div key={b} className="flex items-start gap-3" style={{ color: '#374151' }}>
                        <CheckCircle2 className="w-5 h-5 text-[#591bff] shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ITC ────────────────────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5">
              <span className="w-8 h-px bg-[#f94580]" /> The Difference
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
              Why organisations choose ITC<br />over the national carriers
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6">
            {whyITC.map((w, i) => (
              <FadeIn key={w.title} delay={i * 0.1}>
                <div className="rounded-2xl p-8 h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(249,69,128,0.2), rgba(89,27,255,0.2))', border: '1px solid rgba(249,69,128,0.2)' }}>
                    <w.icon className="w-6 h-6 text-[#f94580]" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-3" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>{w.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{w.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PSTN URGENCY BAND ──────────────────── */}
      <section className="py-16 md:py-24 px-5 md:px-20" style={{ background: 'linear-gradient(135deg, hsl(252,92%,8%) 0%, hsl(260,80%,10%) 100%)', borderTop: '1px solid rgba(249,69,128,0.2)', borderBottom: '1px solid rgba(249,69,128,0.2)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(249,69,128,0.12)', border: '1px solid rgba(249,69,128,0.3)' }}>
              <AlertTriangle className="w-3.5 h-3.5" /> January 31, 2027
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
              The UK's PSTN and ISDN network switches off permanently.
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              If your organisation has not completed its migration, your phone lines, alarm systems, and payment terminals will stop working.
            </p>
            <div className="mb-12">
              <Countdown />
            </div>
            <a href="#contact" className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4)' }}>
              Book a free enterprise estate audit <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS · WHITE ───────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif", color: '#111827' }}>
              Trusted by organisations<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>across Yorkshire and beyond</span>
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <FadeIn key={t.name}>
                <div className="rounded-2xl p-8 h-full flex flex-col justify-between bg-white" style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <blockquote className="text-sm leading-relaxed mb-6 italic" style={{ color: '#374151' }}>"{t.quote}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f94580, #591bff)' }}>{t.initials}</div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#111827' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
            {[1, 2].map((n) => (
              <FadeIn key={n} delay={n * 0.1}>
                <div className="rounded-2xl p-8 h-full flex items-center justify-center bg-white" style={{ border: '1px dashed rgba(0,0,0,0.1)' }}>
                  <p className="text-sm text-center" style={{ color: '#d1d5db' }}>Enterprise client testimonial<br />coming soon</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────── */}
      <section id="contact" className="py-20 md:py-32 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left */}
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5">
              <span className="w-8 h-px bg-[#f94580]" /> Get in Touch
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
              Talk to an enterprise<br />specialist today.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Not a sales team. A specialist who understands multi-site connectivity, PSTN migration, and enterprise procurement - and can give you a straight answer on what it would cost.
            </p>
            <div className="space-y-5">
              <a href="tel:01274952123" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(249,69,128,0.12)', border: '1px solid rgba(249,69,128,0.2)' }}>
                  <Phone className="w-5 h-5 text-[#f94580]" />
                </div>
                <div>
                  <p className="text-white font-bold group-hover:text-[#f94580] transition-colors">01274 952 123</p>
                  <p className="text-white/40 text-xs">Mon–Fri, 9am–5:30pm</p>
                </div>
              </a>
              <a href="mailto:connect@clickitc.co.uk" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(123,231,255,0.12)', border: '1px solid rgba(123,231,255,0.2)' }}>
                  <Mail className="w-5 h-5 text-[#7be7ff]" />
                </div>
                <div>
                  <p className="text-white font-bold group-hover:text-[#7be7ff] transition-colors">connect@clickitc.co.uk</p>
                  <p className="text-white/40 text-xs">Same-day response</p>
                </div>
              </a>
              <a href="/ITC-Services-Brochure.pdf" download className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(89,27,255,0.12)', border: '1px solid rgba(89,27,255,0.2)' }}>
                  <FileText className="w-5 h-5 text-[#591bff]" />
                </div>
                <div>
                  <p className="text-white font-bold group-hover:text-[#591bff] transition-colors">Download enterprise brochure</p>
                  <p className="text-white/40 text-xs">PDF, includes pricing guide</p>
                </div>
              </a>
            </div>
          </FadeIn>

          {/* Right - form */}
          <FadeIn delay={0.15}>
            {submitted ? (
              <div className="rounded-[2rem] p-10 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #f94580, #591bff)' }}>
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>Request received</h3>
                <p className="text-white/60">We'll respond within one business day with a named specialist assigned to your enquiry.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                className="rounded-[2rem] p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{ key: 'name', label: 'Name', placeholder: 'Your name', type: 'text' }, { key: 'org', label: 'Organisation', placeholder: 'Company name', type: 'text' }].map(f => (
                    <div key={f.key} className="space-y-2">
                      <label className="text-sm font-bold text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all text-white placeholder-white/30 text-sm"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Visby CF', 'Manrope', sans-serif" }} />
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>Number of Sites</label>
                    <input type="text" placeholder="e.g. 3" value={form.sites}
                      onChange={e => setForm(p => ({ ...p, sites: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all text-white placeholder-white/30 text-sm"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Visby CF', 'Manrope', sans-serif" }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>Primary Need</label>
                    <select value={form.need} onChange={e => setForm(p => ({ ...p, need: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all text-white text-sm"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>
                      <option value="" className="bg-gray-900">Select...</option>
                      <option value="connectivity" className="bg-gray-900">Connectivity</option>
                      <option value="voip" className="bg-gray-900">VoIP</option>
                      <option value="mobile" className="bg-gray-900">Mobile</option>
                      <option value="pstn" className="bg-gray-900">PSTN Migration</option>
                      <option value="full" className="bg-gray-900">Full Review</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white" style={{ fontFamily: "'Visby CF', 'Manrope', sans-serif" }}>Message</label>
                  <textarea rows={4} placeholder="Tell us about your requirements..." value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all text-white placeholder-white/30 text-sm resize-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Visby CF', 'Manrope', sans-serif" }} />
                </div>
                <button type="submit" className="w-full py-4 rounded-full font-bold text-base text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 24px rgba(249,69,128,0.3)' }}>
                  Request a consultation
                </button>
                <p className="text-center text-xs text-white/30">No obligation. We'll respond within one business day with a named specialist assigned to your enquiry.</p>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ── INTERNAL LINKS ─────────────────────── */}
      <section className="py-12 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5 text-center">Detailed service guides</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'PSTN Migration', href: '/enterprise/pstn-migration' },
              { label: 'Business Leased Lines', href: '/enterprise/leased-lines' },
              { label: 'Enterprise VoIP', href: '/enterprise/voip' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {l.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
