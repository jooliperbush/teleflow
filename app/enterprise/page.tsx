'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle2, Phone, Download } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar'
import MarketingFooter from '@/app/components/marketing/MarketingFooter'

const NAVY = '#1B2A6B'

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

const trustBadges = [
  'Ofcom Registered',
  'Ombudsman Approved',
  'BT Openreach Partner',
  'Gamma Partner',
  'Official Supplier — Bradford UK City of Culture',
]

const services = [
  {
    tag: 'Internet & Connectivity',
    title: 'Enterprise connectivity that\'s proactively managed, not just delivered.',
    body: 'From dedicated leased lines to multi-site full fibre, we design and manage connectivity that meets your SLA requirements — not a generic business package with a business price tag. Proactive 24/7 monitoring means most faults are identified and escalated before you\'re aware of them.',
    bullets: [
      'Leased lines, FTTP, and EFM across all major UK carriers',
      'Business SLA with guaranteed response and fix times',
      'Proactive monitoring with named engineer escalation',
      'Scalable from a single site to 100+ locations',
      'Direct Openreach relationship for faster fault resolution',
    ],
    cta: 'Check availability at your postcode',
    href: '/order',
    gradient: 'linear-gradient(135deg, #591bff 0%, #7be7ff 100%)',
  },
  {
    tag: 'Hosted VoIP & Unified Communications',
    title: 'Phone systems built for how enterprise teams actually work.',
    body: 'Cloud-based telephony that works across desk phones, softphones, and mobiles — with call recording, IVR, hunt groups, and analytics included as standard. With the PSTN switching off in January 2027, we manage the migration from audit to go-live, across every site.',
    bullets: [
      '100% uptime SLA with fully redundant infrastructure',
      'Unlimited UK calls across landlines and major mobile networks',
      'Microsoft Teams Direct Routing available',
      'Multi-site rollout with dedicated project management',
      'Full 2027 PSTN compliance — we\'ve migrated 80% of our client base already',
    ],
    cta: 'Get a VoIP quote',
    href: '/order',
    gradient: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)',
  },
  {
    tag: 'Mobile Fleet Management',
    title: 'One fleet. Multiple networks. Complete visibility.',
    body: 'We\'re not tied to one network, so we put your team on the tariff that actually fits — across O2, Vodafone, EE, and Three. Fleet management portal, spend controls, and usage alerts give your operations team full visibility without the admin overhead.',
    bullets: [
      'Multi-network SIMs across O2, Vodafone, EE, and Three',
      'Centralised fleet management portal',
      'Spend controls and usage alerts per user',
      'Rollover data pooling across your fleet',
      'International roaming plans for travelling teams',
    ],
    cta: 'Talk to a mobile specialist',
    href: '/order',
    gradient: 'linear-gradient(135deg, #f94580 0%, #f9a030 100%)',
  },
]

export default function EnterprisePage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(252, 92%, 10%)' }}>
      <MarketingNavbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 px-5 md:px-20">
        {/* background */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero-bg.jpg" alt="" fill className="object-cover object-center opacity-30" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(8,4,25,0.92) 0%, rgba(8,4,25,0.75) 60%, rgba(8,4,25,0.50) 100%)' }} />
        </div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(89,27,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
              Enterprise Communications
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Enterprise telecoms<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                without the enterprise runaround.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Multi-site connectivity, managed VoIP, mobile fleet, and PSTN migration — handled by a dedicated team who know your account. No call centres. No ticket queues. No carrier bias.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
                style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                Speak to an enterprise specialist <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="/ITC-Services-Brochure.pdf" download className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white/90"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
                <Download className="w-4 h-4" /> Download our enterprise brochure
              </a>
            </div>
          </FadeIn>

          {/* Trust strip */}
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              {trustBadges.map((b) => (
                <span key={b} className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#f94580] inline-block" />
                  {b}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PULL QUOTE ───────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-5 md:px-20" style={{ background: 'hsl(252, 92%, 13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="w-12 h-1 mx-auto mb-8 rounded-full" style={{ background: 'linear-gradient(to right, #f94580, #591bff)' }} />
            <blockquote className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight mb-8" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              "ITC's commitment to simplicity, reliability, and doing the right thing is evident in every interaction."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f94580, #591bff)' }}>MO</div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Miriam O'Keeffe</p>
                <p className="text-white/50 text-xs">Operations Director — Bradford UK City of Culture</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROBLEM SECTION ──────────────────────────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: 'hsl(252, 92%, 10%)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f94580] mb-5">
              <span className="w-8 h-px bg-[#f94580]" /> The Problem
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-0" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              The problem with most enterprise telecoms providers
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Most large providers offer enterprise-grade infrastructure — and a support experience that doesn't match it. Tickets go unanswered. Account managers change every six months. Billing errors take quarters to resolve. And when you escalate, you're told it's a carrier issue, not theirs.
            </p>
            <p className="text-white font-semibold text-lg leading-relaxed">
              ITC operates differently. We're independently owned, carrier-neutral, and structured so that every enterprise client has a named account manager with the authority to act — not just log a ticket.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-5 md:px-20" style={{ background: 'linear-gradient(135deg, hsl(252,92%,12%) 0%, hsl(260,80%,14%) 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Everything your organisation needs.<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                One partner, one invoice.
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We supply and manage the full communications stack for multi-site UK organisations — broadband, voice, mobile, and infrastructure — with a single point of accountability across all of it.
            </p>
          </FadeIn>

          <div className="space-y-8">
            {services.map((s, i) => (
              <FadeIn key={s.tag} delay={i * 0.1}>
                <div className="rounded-[2rem] p-8 md:p-12 grid md:grid-cols-2 gap-10 items-start" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {/* Left */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block" style={{ color: '#f94580' }}>{s.tag}</span>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>{s.title}</h3>
                    <p className="text-white/65 leading-relaxed mb-6">{s.body}</p>
                    <Link href={s.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:opacity-90"
                      style={{ background: s.gradient }}>
                      {s.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  {/* Right — bullets */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#f94580] mb-4">Included</p>
                    {s.bullets.map((b) => (
                      <div key={b} className="flex items-start gap-3 text-white/85">
                        <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
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

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-5 md:px-20 text-center" style={{ background: 'hsl(252,92%,10%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
            Ready to talk to a<br />
            <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>real specialist?</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">No holding music. No generic quote tool. Just a conversation with someone who understands enterprise telecoms.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
              style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4)' }}>
              Speak to an enterprise specialist <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="tel:01274952123" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white/90"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Phone className="w-4 h-4" /> 01274 952 123
            </a>
          </div>
        </FadeIn>
      </section>

      <MarketingFooter />
    </div>
  )
}
