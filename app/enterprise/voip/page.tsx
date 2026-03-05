'use client'

import { useRef, useState, useEffect } from 'react'
import { ArrowRight, CheckCircle2, Phone, ChevronDown } from 'lucide-react'
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

const faqs = [
  { q: 'What is enterprise VoIP and how does it work?', a: 'Enterprise VoIP (Voice over Internet Protocol) routes phone calls digitally over your internet connection rather than over traditional copper phone lines. Calls are compressed, encrypted, and transmitted as data packets — resulting in lower cost, higher flexibility, and features that legacy PBX systems can\'t match.' },
  { q: 'Can VoIP work across multiple sites?', a: 'Yes — this is one of the primary advantages of hosted VoIP for enterprise. All sites share the same phone system platform, with centralised management, unified numbering, and features like hunt groups and IVR working seamlessly across every location. Staff can transfer calls between sites as easily as if they were in the same building.' },
  { q: 'Does ITC offer Microsoft Teams Direct Routing?', a: 'Yes. ITC provides Teams Direct Routing, which connects your Microsoft Teams environment to the public telephone network — allowing Teams to function as your full business phone system without a separate handset or PBX. This is increasingly the preferred approach for enterprise organisations already invested in the Microsoft 365 ecosystem.' },
  { q: 'What happens to our phones during the PSTN switch-off in 2027?', a: 'Any phone system running over PSTN or ISDN lines will stop working after 31 January 2027. A hosted VoIP migration replaces your legacy infrastructure with cloud-based telephony — meaning your phones continue to work post-switch-off. ITC manages this migration as part of our standard enterprise VoIP deployment.' },
  { q: 'What call recording options are available with enterprise VoIP?', a: 'ITC\'s hosted VoIP platform includes call recording as standard, with options for on-demand recording, automatic recording of all calls, or department-level recording rules. Recordings are stored securely, searchable, and can be integrated with your CRM if required. This is included in the core platform — not an additional cost.' },
  { q: 'How does VoIP handle remote and hybrid workers?', a: 'Hosted VoIP is specifically well-suited to hybrid working. Users can access the full phone system from a desktop app, mobile app, or desk phone — with the same number, extension, and feature set regardless of location. There\'s no VPN required and no separate licencing for remote users.' },
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

export default function EnterpriseVoIPPage() {
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
              Business VoIP · Enterprise · Yorkshire & UK
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.92] tracking-tighter mb-6 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Enterprise VoIP<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                phone systems for UK business.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              Hosted telephony that works across desk phones, softphones, and mobiles — with call recording, hunt groups, IVR, and Microsoft Teams Direct Routing included as standard. 100% uptime SLA, fully 2027 PSTN-compliant.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
                style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.4)' }}>
                Get an enterprise VoIP quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="tel:01274952123" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white/90"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Phone className="w-4 h-4" /> 01274 952 123
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Built for how enterprise<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #f94580, #591bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>teams actually work</span>
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Multi-site unified', body: 'One phone system across all your locations. Hunt groups, transfers, and conferencing work as if everyone is in the same building.' },
              { title: 'Teams Direct Routing', body: 'Use Microsoft Teams as your business phone system — no separate handsets, no additional platform, no separate billing.' },
              { title: 'Call recording', body: 'Automatic or on-demand call recording with secure cloud storage, searchable logs, and CRM integration options.' },
              { title: 'Desktop & mobile apps', body: 'Full phone system functionality from any device — office, home, or mobile. No VPN. No separate licence.' },
              { title: '100% uptime SLA', body: 'Fully redundant infrastructure with contractual uptime commitment and engineer response on breach.' },
              { title: 'Unlimited UK calls', body: 'Unlimited calls to UK landlines and major mobile networks included as standard across all user licences.' },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="rounded-2xl p-7 h-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-2 h-6 rounded-full mb-4" style={{ background: 'linear-gradient(to bottom, #f94580, #591bff)' }} />
                  <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>{f.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>What's included</h2>
          </FadeIn>
          <FadeIn>
            <div className="space-y-3 text-left">
              {['100% uptime SLA with fully redundant infrastructure', 'Unlimited UK calls across landlines and major mobile networks', 'Microsoft Teams Direct Routing available', 'Multi-site rollout with dedicated project management', "Full 2027 PSTN compliance — we've migrated 80% of our client base already", 'Call recording, IVR, hunt groups, and voicemail-to-email included', 'Desktop and mobile apps for hybrid and remote workers', 'From £12/user/month — scales from 1 to hundreds of users'].map(b => (
                <div key={b} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* LOCAL */}
      <section className="py-12 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <p className="text-white/40 text-sm font-medium">Enterprise VoIP deployments across</p>
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {['Bradford', 'Leeds', 'Sheffield', 'Huddersfield', 'Halifax', 'Wakefield', 'York', 'Manchester', 'UK-wide'].map(loc => (
                <span key={loc} className="text-xs font-bold text-white/60 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>{loc}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Enterprise VoIP — questions answered</h2>
          </FadeIn>
          <FadeIn><FAQ /></FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-5 md:px-20 text-center" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Ready for a VoIP quote?</h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto mb-10">Tell us your user count and sites — we'll come back with pricing the same day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
              style={{ background: 'linear-gradient(135deg, #f94580 0%, #591bff 100%)', boxShadow: '0 0 30px rgba(249,69,128,0.35)' }}>
              Get a quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
