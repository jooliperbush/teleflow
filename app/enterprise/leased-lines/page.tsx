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
  { q: 'What is a leased line and how does it differ from business broadband?', a: 'A leased line is a dedicated, symmetric internet connection between your premises and the network, with equal upload and download speeds and an SLA guarantee. Business broadband is shared infrastructure — your speed and reliability varies depending on contention. Leased lines are uncontended and point-to-point.' },
  { q: 'What speeds are available on leased lines in the UK?', a: 'Leased lines are available from 10 Mbps up to 10 Gbps+ depending on your location and provider. The most common enterprise options are 100 Mbps, 500 Mbps, and 1 Gbps. ITC will survey your site and recommend the right speed and technology (EFM, FTTP, or Ethernet First Mile) based on what\'s available at your postcode.' },
  { q: 'How long does leased line installation take?', a: 'Typically 30–90 days from order to installation, depending on distance from the nearest exchange, whether new civils work is required, and Openreach surveying. ITC manages the full installation process and will give you a firm date after the initial survey.' },
  { q: 'What SLA comes with a business leased line?', a: 'ITC\'s leased line product includes a business-grade SLA with guaranteed fault response times (typically 4-hour fix) and uptime commitments above 99.95%. Unlike broadband, SLA breaches on leased lines carry a compensation obligation.' },
  { q: 'Can ITC connect multiple sites on a leased line?', a: 'Yes. ITC designs and manages multi-site MPLS (Multi-Protocol Label Switching) networks that link multiple offices on private, secure connectivity. Each site gets a dedicated leased line, and traffic is prioritised across the network — ideal for VoIP, video conferencing, and cloud applications.' },
  { q: 'What is the difference between EFM and Ethernet leased lines?', a: 'EFM (Ethernet in the First Mile) uses bonded copper pairs to deliver symmetric speeds — typically up to 35 Mbps — and is available where full fibre isn\'t yet accessible. Ethernet leased lines are delivered on fibre and support much higher speeds. ITC will recommend the right technology based on your location.' },
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

export default function LeasedLinesPage() {
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
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-6 px-4 py-2 rounded-full" style={{ background: 'rgba(89,27,255,0.15)', border: '1px solid rgba(89,27,255,0.3)' }}>
              Enterprise Connectivity · Yorkshire & UK
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.92] tracking-tighter mb-6 text-white" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Business leased lines.<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dedicated. Uncontended. Managed.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              Symmetric, guaranteed connectivity for multi-site UK organisations — from 10 Mbps to 10 Gbps. ITC designs, installs, and proactively monitors your leased line estate with a named engineer on every account.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
                style={{ background: 'linear-gradient(135deg, #591bff 0%, #7be7ff 100%)', boxShadow: '0 0 30px rgba(89,27,255,0.4)' }}>
                Check availability at your postcode <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="tel:01274952123" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white/90"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Phone className="w-4 h-4" /> 01274 952 123
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHY LEASED LINE */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)' }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>
              Why leased lines for<br />
              <span style={{ backgroundImage: 'linear-gradient(to right, #591bff, #7be7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>enterprise connectivity?</span>
            </h2>
            <p className="text-white/65 leading-relaxed mb-6">Business broadband is shared infrastructure. When your neighbours are busy, your speeds drop. A leased line is a point-to-point dedicated circuit — your bandwidth is yours, your SLA is contractual, and your performance is consistent at 9 AM Monday as it is at 2 PM Friday.</p>
            <p className="text-white/65 leading-relaxed">For multi-site organisations running VoIP, cloud applications, and video conferencing simultaneously, uncontended connectivity isn't a luxury — it's a requirement.</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Symmetrical speeds', desc: 'Equal upload and download — critical for VoIP, video, and cloud backups' },
                { label: 'Uncontended circuit', desc: 'No sharing with neighbours. Your bandwidth is guaranteed around the clock' },
                { label: 'Contractual SLA', desc: '4-hour fix SLA with compensation for downtime — not a best-effort commitment' },
                { label: 'Scalable on demand', desc: 'Upgrade your speed without changing hardware — from 100 Mbps to 1 Gbps when you need it' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'rgba(89,27,255,0.08)', border: '1px solid rgba(89,27,255,0.2)' }}>
                  <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm mb-1">{item.label}</p>
                    <p className="text-white/55 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-20 md:py-28 px-5 md:px-20" style={{ background: 'hsl(252,92%,10%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn className="mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>What's included</h2>
            <p className="text-white/55">Every ITC leased line comes fully managed — not just delivered.</p>
          </FadeIn>
          <FadeIn>
            <div className="space-y-3 text-left">
              {['Leased lines, FTTP, and EFM across all major UK carriers', 'Business SLA with guaranteed 4-hour response and fix', 'Proactive 24/7 monitoring with named engineer escalation', 'Scalable from a single site to 100+ locations', 'Direct BT Openreach relationship for faster fault resolution', 'Static IP addresses and hardware included', 'Multi-site MPLS networking available'].map(b => (
                <div key={b} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <CheckCircle2 className="w-5 h-5 text-[#7be7ff] shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{b}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* LOCAL SEO BAND */}
      <section className="py-12 px-5 md:px-20" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <FadeIn>
            <p className="text-white/40 text-sm font-medium">Supplying enterprise leased lines across</p>
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
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Leased line questions answered</h2>
          </FadeIn>
          <FadeIn><FAQ /></FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-5 md:px-20 text-center" style={{ background: 'hsl(252,92%,13%)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Ready to quote a leased line?</h2>
          <p className="text-white/55 text-lg max-w-xl mx-auto mb-10">Enter your postcode and we'll show you what's available at your site within minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-base text-white group"
              style={{ background: 'linear-gradient(135deg, #591bff 0%, #7be7ff 100%)', boxShadow: '0 0 30px rgba(89,27,255,0.35)' }}>
              Check availability <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
