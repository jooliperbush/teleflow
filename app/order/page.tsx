'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import MarketingNavbar from '@/app/components/marketing/MarketingNavbar'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CompanyResult {
  company_number: string
  title: string
  date_of_creation?: string
  registered_office_address?: {
    address_line_1?: string
    locality?: string
    postal_code?: string
  }
  company_status?: string
}

interface Product {
  type: 'fttp' | 'fttc' | 'sogea' | 'gfast' | 'adsl' | 'lease_line' | 'voip' | 'mobile'
  name: string
  downloadMbps?: number
  uploadMbps?: number
  monthlyCost: number | null
  setupFee: number | null
  available: boolean
  requiresCallback?: boolean
}

interface SelectedProduct {
  type: string
  name: string
  quantity: number
  unitMonthly: number
  monthlyTotal: number
  requiresCallback?: boolean
}

interface AppointmentSlot {
  date: string
  startTime: string
  endTime: string
  type: string
}

interface ZenAddress {
  goldAddressKey: string
  districtCode: string
  uprn: string
  displayAddress: string
}

interface OrderState {
  id?: string
  // Step 1
  businessType: 'ltd' | 'sole_trader' | 'partnership'
  companyName: string
  companyNumber: string
  companyReference: string
  registeredAddress: CompanyResult['registered_office_address']
  incorporatedDate: string
  companyStatus: string
  contactName: string
  contactEmail: string
  contactPhone: string
  siteAddressLine1: string
  siteAddressLine2: string
  siteCity: string
  sitePostcode: string
  // Step 2
  selectedProducts: SelectedProduct[]
  requiresCallback: boolean
  zenAvailabilityRef?: string
  selectedAddress?: ZenAddress
  appointment?: { date: string; startTime: string; endTime: string; type: string }
  leaseLine?: { bandwidth: number; term: number; monthlyPrice: number; setupFee: number }
  // Step 3
  quoteReference: string
  quoteTerm: number
  monthlyTotal: number
  annualTotal: number
  quoteSent: boolean
  // Step 2
  authorisedToSign: boolean
  // Step 5
  signedName: string
  signedAt: string
  // Step 5
  ddAccountHolder: string
  ddSortCode: string
  ddAccountNumberLast4: string
  ddConfirmed: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NAVY = '#591bff'

function generateCompanyRef(name: string, incorporatedDate: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
  if (!incorporatedDate) return prefix + 'XXXXXXXX'
  const d = new Date(incorporatedDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${prefix}${dd}${mm}${yyyy}`
}

function generateQuoteRef(): string {
  const d = new Date()
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `QTE-${date}-${rand}`
}

const MARGIN = 1.25 // 25% markup

// ─── Journey Selector ────────────────────────────────────────────────────────

type Journey = 'internet' | 'voip' | 'mobile' | 'pstn'

const JOURNEYS: { id: Journey; icon: string; title: string; subtitle: string; badge?: string }[] = [
  { id: 'internet',  icon: '/icons/icon-internet.svg',  title: 'Internet',           subtitle: 'Full fibre broadband for your business' },
  { id: 'voip',      icon: '/icons/icon-voip.svg',      title: 'VoIP Phone System',  subtitle: 'Cloud phones from £7.99/seat' },
  { id: 'mobile',    icon: '/icons/icon-mobile.svg',    title: 'Mobile',             subtitle: 'O2, Vodafone, Three & EE for your team' },
  { id: 'pstn',      icon: '/icons/icon-landline.svg',  title: 'Landline Migration', subtitle: 'Switch before the 2027 PSTN deadline', badge: 'Deadline approaching' },
]

function JourneySelector({ onSelect }: { onSelect: (j: Journey) => void }) {
  return (
    <div>
      <p className="text-white/50 text-sm mb-6 text-center">What are you looking for today?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {JOURNEYS.map(j => (
          <button
            key={j.id}
            onClick={() => onSelect(j.id)}
            className="relative text-left rounded-2xl p-5 transition-all group"
            style={{ background: 'hsl(252,60%,16%)', border: '1.5px solid hsl(252,50%,28%)' }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#f94580')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'hsl(252,50%,28%)')}
          >
            {j.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(249,69,128,0.15)', color: '#f94580', border: '1px solid rgba(249,69,128,0.3)' }}>
                {j.badge}
              </span>
            )}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(249,69,128,0.12)' }}>
              <img src={j.icon} alt={j.title} className="w-7 h-7" />
            </div>
            <p className="text-white font-bold text-base mb-1">{j.title}</p>
            <p className="text-white/45 text-xs leading-relaxed">{j.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Callback Form (for journeys not yet fully built) ─────────────────────────

// ─── VoIP Builder ────────────────────────────────────────────────────────────

const VOIP_HARDWARE = [
  { id: 'none', label: 'App / Softphone only', price: 0,    note: 'Desktop & mobile app' },
  { id: 't54w', label: 'Yealink T54W',          price: 4.99, note: 'Mid-range desk phone' },
  { id: 't57w', label: 'Yealink T57W',          price: 7.99, note: 'Premium desk phone' },
  { id: 'w76p', label: 'Yealink W76P',          price: 4.99, note: 'DECT wireless handset' },
]

// Power / switching options — all gigabit capable, one-off cost
const POE_OPTIONS = [
  { id: 'none',   label: 'No switch needed',          price: 0,   note: 'App only — no hardware' },
  { id: 'psu',    label: 'Power Supply (1 phone)',     price: 15,  note: 'Single desk phone power' },
  { id: 'poe4',   label: '4-port Gigabit PoE',         price: 50,  note: 'Up to 4 phones' },
  { id: 'poe8',   label: '8-port Gigabit PoE',         price: 100, note: 'Up to 8 phones' },
  { id: 'poe24',  label: '24-port Gigabit PoE',        price: 295, note: 'Up to 24 phones' },
]

function suggestPoE(seats: number): string {
  if (seats === 1) return 'psu'
  if (seats <= 4)  return 'poe4'
  if (seats <= 8)  return 'poe8'
  return 'poe24'
}

const VOIP_SEAT_PRICE    = 7.99
const VOIP_ANALYTICS     = 2.99
const VOIP_SIM_PRICE     = 20 // unlimited SIM, per month
const VOIP_INSTALL_PRICE = 195 // professional on-site install, one-off

function VoIPBuilder({ onBack, onComplete }: {
  onBack: () => void
  onComplete: (products: Product[], term: number) => void
}) {
  const [seats, setSeats]         = useState(5)
  const [hardware, setHardware]   = useState('none')
  const [poe, setPoe]             = useState('none')
  const [analytics, setAnalytics] = useState(false)
  const [sims, setSims]           = useState(0)
  const [install, setInstall]     = useState(false)
  const [term, setTerm]           = useState(36)

  // Auto-suggest PoE when hardware changes
  function handleHardwareChange(id: string) {
    setHardware(id)
    setPoe(id === 'none' ? 'none' : suggestPoE(seats))
  }

  // Re-suggest PoE when seat count changes (only if hardware already selected)
  function handleSeatsChange(n: number) {
    setSeats(n)
    if (hardware !== 'none') setPoe(suggestPoE(n))
  }

  const hw              = VOIP_HARDWARE.find(h => h.id === hardware)!
  const poeOption       = POE_OPTIONS.find(p => p.id === poe)!
  const monthlyPerSeat  = VOIP_SEAT_PRICE + hw.price + (analytics ? VOIP_ANALYTICS : 0)
  const monthlyTotal    = monthlyPerSeat * seats + sims * VOIP_SIM_PRICE
  const oneOffTotal     = poeOption.price + (install ? VOIP_INSTALL_PRICE : 0)
  const upfront12       = monthlyTotal * 12 + oneOffTotal

  function handleContinue() {
    const products: Product[] = [
      {
        type: 'voip',
        name: `VoIP Seat${analytics ? ' + Analytics' : ''}${hardware !== 'none' ? ` + ${hw.label}` : ''}`,
        monthlyCost: monthlyPerSeat,
        setupFee: 0,
        available: true,
        downloadMbps: 0,
        uploadMbps: 0,
        quantity: seats,
        monthlyTotal,
      } as unknown as Product,
    ]
    if (sims > 0) {
      products.push({
        type: 'voip',
        name: 'Unlimited SIM',
        monthlyCost: VOIP_SIM_PRICE,
        setupFee: 0,
        available: true,
        downloadMbps: 0,
        uploadMbps: 0,
        quantity: sims,
        monthlyTotal: sims * VOIP_SIM_PRICE,
      } as unknown as Product)
    }
    if (poeOption.price > 0) {
      products.push({
        type: 'voip',
        name: `${poeOption.label} (one-off)`,
        monthlyCost: 0,
        setupFee: poeOption.price,
        available: true,
        downloadMbps: 0,
        uploadMbps: 0,
        quantity: 1,
        monthlyTotal: 0,
      } as unknown as Product)
    }
    if (install) {
      products.push({
        type: 'voip',
        name: 'Professional Installation (one-off)',
        monthlyCost: 0,
        setupFee: VOIP_INSTALL_PRICE,
        available: true,
        downloadMbps: 0,
        uploadMbps: 0,
        quantity: 1,
        monthlyTotal: 0,
      } as unknown as Product)
    }
    onComplete(products, term)
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-6 px-3 py-2 rounded-lg"
        style={{ border: '1px solid hsl(252,50%,32%)', background: 'hsl(252,60%,16%)' }}>
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-1">Build Your VoIP System</h2>
      <p className="text-white/45 text-sm mb-6">Customise your package — pricing updates as you go.</p>

      {/* Seats */}
      <div className="rounded-xl p-4 mb-3" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Number of seats</p>
            <p className="text-white/40 text-xs">£{VOIP_SEAT_PRICE}/seat/mo — app + unlimited UK calls</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSeatsChange(Math.max(1, seats - 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'hsl(252,60%,24%)', border: '1px solid hsl(252,50%,35%)' }}>−</button>
            <span className="text-white font-bold text-lg w-6 text-center">{seats}</span>
            <button onClick={() => handleSeatsChange(Math.min(100, seats + 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'hsl(252,60%,24%)', border: '1px solid hsl(252,50%,35%)' }}>+</button>
          </div>
        </div>
      </div>

      {/* Hardware */}
      <div className="rounded-xl p-4 mb-3" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <p className="text-white font-semibold text-sm mb-3">Hardware per seat</p>
        <div className="grid grid-cols-2 gap-2">
          {VOIP_HARDWARE.map(h => (
            <button key={h.id} onClick={() => handleHardwareChange(h.id)}
              className="text-left p-3 rounded-lg transition-all"
              style={hardware === h.id
                ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
                : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
              <p className="text-white text-xs font-semibold">{h.label}</p>
              <p className="text-white/40 text-[10px]">{h.price > 0 ? `+£${h.price.toFixed(2)}/seat/mo` : 'Included'}</p>
              <p className="text-white/30 text-[10px]">{h.note}</p>
            </button>
          ))}
        </div>
      </div>

      {/* PoE / Power switch — only shown when hardware selected */}
      {hardware !== 'none' && (
        <div className="rounded-xl p-4 mb-3" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold text-sm">Power / Switching</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(123,231,255,0.1)', color: '#7be7ff', border: '1px solid rgba(123,231,255,0.25)' }}>All Gigabit</span>
          </div>
          <p className="text-white/40 text-xs mb-3">One-off hardware cost — auto-suggested for your seat count</p>
          <div className="grid grid-cols-2 gap-2">
            {POE_OPTIONS.filter(p => p.id !== 'none').map(p => (
              <button key={p.id} onClick={() => setPoe(p.id)}
                className="text-left p-3 rounded-lg transition-all"
                style={poe === p.id
                  ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
                  : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
                <p className="text-white text-xs font-semibold">{p.label}</p>
                <p className="text-white/40 text-[10px]">£{p.price} one-off</p>
                <p className="text-white/30 text-[10px]">{p.note}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analytics add-on */}
      <label className="rounded-xl p-4 mb-3 flex items-center justify-between cursor-pointer"
        style={{ background: 'hsl(252,60%,16%)', border: `1px solid ${analytics ? '#591bff' : 'hsl(252,50%,28%)'}` }}>
        <div>
          <p className="text-white font-semibold text-sm">Call Analytics</p>
          <p className="text-white/40 text-xs">Call recording, reporting & hunt groups — +£{VOIP_ANALYTICS.toFixed(2)}/seat/mo</p>
        </div>
        <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)}
          className="w-4 h-4 accent-[#591bff]" />
      </label>



      {/* Installation */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <p className="text-white font-semibold text-sm mb-3">Installation</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setInstall(false)}
            className="text-left p-3 rounded-lg transition-all"
            style={!install
              ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
              : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
            <p className="text-white text-xs font-semibold">Self Install</p>
            <p className="text-white/40 text-[10px]">Free of charge</p>
          </button>
          <button onClick={() => setInstall(true)}
            className="text-left p-3 rounded-lg transition-all"
            style={install
              ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
              : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
            <p className="text-white text-xs font-semibold">Professional Install</p>
            <p className="text-white/40 text-[10px]">£{VOIP_INSTALL_PRICE} one-off</p>
            <p className="text-white/30 text-[10px]">Engineer on-site setup</p>
          </button>
        </div>
      </div>

      {/* Contract term */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <p className="text-white font-semibold text-sm mb-3">Contract length</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ val: 36, label: '36 months', sub: 'Best value' }, { val: 12, label: '12 months', sub: 'Billed upfront' }].map(t => (
            <button key={t.val} onClick={() => setTerm(t.val)}
              className="p-3 rounded-lg text-left transition-all"
              style={term === t.val
                ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
                : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
              <p className="text-white text-xs font-semibold">{t.label}</p>
              <p className="text-white/40 text-[10px]">{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ITC internet notice */}
      <div className="rounded-lg px-3 py-2.5 mb-5 flex items-start gap-2" style={{ background: 'rgba(249,69,128,0.07)', border: '1px solid rgba(249,69,128,0.25)' }}>
        <span className="text-[#f94580] text-xs mt-0.5">★</span>
        <p className="text-white/60 text-xs">VoIP works on any broadband but performs best on ITC's managed fibre — guaranteed QoS, no dropped calls.</p>
      </div>

      {/* SIM special offer */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'linear-gradient(135deg, rgba(249,69,128,0.12) 0%, rgba(89,27,255,0.18) 100%)', border: '1.5px solid rgba(249,69,128,0.4)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,69,128,0.2)', color: '#f94580', border: '1px solid rgba(249,69,128,0.4)' }}>
                🎁 VoIP Customer Offer
              </span>
            </div>
            <p className="text-white font-bold text-sm mb-0.5">Add Mobile SIMs</p>
            <p className="text-white/50 text-xs">Unlimited calls & data — exclusive rate when bundled with VoIP</p>
            <p className="text-[#f94580] font-bold text-base mt-1">£{VOIP_SIM_PRICE}<span className="text-white/40 font-normal text-xs">/SIM/mo</span></p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => setSims(s => Math.max(0, s - 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'rgba(249,69,128,0.2)', border: '1px solid rgba(249,69,128,0.4)' }}>−</button>
            <span className="text-white font-bold text-lg w-6 text-center">{sims}</span>
            <button onClick={() => setSims(s => Math.min(100, s + 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'rgba(249,69,128,0.2)', border: '1px solid rgba(249,69,128,0.4)' }}>+</button>
          </div>
        </div>
        {sims > 0 && (
          <p className="text-white/50 text-xs mt-2 pt-2" style={{ borderTop: '1px solid rgba(249,69,128,0.2)' }}>
            {sims} SIM{sims > 1 ? 's' : ''} × £{VOIP_SIM_PRICE}/mo = <span className="text-white font-semibold">£{(sims * VOIP_SIM_PRICE).toFixed(2)}/mo</span>
          </p>
        )}
      </div>

      {/* Price summary */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(89,27,255,0.12)', border: '1px solid rgba(89,27,255,0.4)' }}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/60">{seats} seat{seats > 1 ? 's' : ''} × £{monthlyPerSeat.toFixed(2)}/mo</span>
          <span className="text-white font-semibold">£{(monthlyPerSeat * seats).toFixed(2)}/mo</span>
        </div>
        {sims > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/60">{sims} SIM{sims > 1 ? 's' : ''} × £{VOIP_SIM_PRICE}/mo</span>
            <span className="text-white font-semibold">£{(sims * VOIP_SIM_PRICE).toFixed(2)}/mo</span>
          </div>
        )}
        {poeOption.price > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/60">{poeOption.label}</span>
            <span className="text-white font-semibold">£{poeOption.price}</span>
          </div>
        )}
        {install && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/60">Professional Installation</span>
            <span className="text-white font-semibold">£{VOIP_INSTALL_PRICE}</span>
          </div>
        )}
        {oneOffTotal > 0 && (
          <div className="flex justify-between text-xs mb-1 pt-1" style={{ borderTop: '1px solid rgba(89,27,255,0.2)' }}>
            <span className="text-white/50">One-off total</span>
            <span className="text-white/70">£{oneOffTotal}</span>
          </div>
        )}
        {term === 12 ? (
          <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid rgba(89,27,255,0.3)' }}>
            <span className="text-white/80 font-semibold">12-month total (upfront)</span>
            <span className="text-white font-bold">£{upfront12.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid rgba(89,27,255,0.3)' }}>
            <span className="text-white/80 font-semibold">Monthly total</span>
            <span className="text-white font-bold">£{monthlyTotal.toFixed(2)}/mo</span>
          </div>
        )}
        <p className="text-white/35 text-[10px] mt-2">All prices ex. VAT · {term}-month contract</p>
      </div>

      <button onClick={handleContinue} className="itc-gradient-btn w-full py-3.5 rounded-xl font-semibold text-white text-base">
        Continue →
      </button>
    </div>
  )
}

// ─── Mobile Builder ──────────────────────────────────────────────────────────

const MOBILE_NETWORKS = [
  { id: 'ee',        label: 'EE',        color: '#00b0ca' },
  { id: 'o2',        label: 'O2',        color: '#0019a5' },
  { id: 'vodafone',  label: 'Vodafone',  color: '#e60000' },
  { id: 'three',     label: 'Three',     color: '#f60' },
]

const MOBILE_SIM_PRICE = 20

function MobileBuilder({ onBack, onComplete }: {
  onBack: () => void
  onComplete: (products: Product[], term: number) => void
}) {
  const [sims, setSims]       = useState(1)
  const [network, setNetwork] = useState('ee')
  const [term, setTerm]       = useState(36)

  const monthlyTotal = sims * MOBILE_SIM_PRICE
  const upfront12    = monthlyTotal * 12

  function handleContinue() {
    const net = MOBILE_NETWORKS.find(n => n.id === network)!
    const products: Product[] = [
      {
        type: 'mobile',
        name: `Unlimited SIM — ${net.label}`,
        monthlyCost: MOBILE_SIM_PRICE,
        setupFee: 0,
        available: true,
        downloadMbps: 0,
        uploadMbps: 0,
        quantity: sims,
        monthlyTotal,
      } as unknown as Product,
    ]
    onComplete(products, term)
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-6 px-3 py-2 rounded-lg"
        style={{ border: '1px solid hsl(252,50%,32%)', background: 'hsl(252,60%,16%)' }}>
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-1">Mobile SIMs</h2>
      <p className="text-white/45 text-sm mb-6">How many SIMs do you need?</p>

      {/* SIM count */}
      <div className="rounded-xl p-4 mb-3" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">{sims === 1 ? 'Single SIM' : `${sims} SIMs`}</p>
            <p className="text-white/40 text-xs">£{MOBILE_SIM_PRICE}/SIM/mo — unlimited calls & data</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSims(s => Math.max(1, s - 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'hsl(252,60%,24%)', border: '1px solid hsl(252,50%,35%)' }}>−</button>
            <span className="text-white font-bold text-lg w-6 text-center">{sims}</span>
            <button onClick={() => setSims(s => Math.min(100, s + 1))}
              className="w-8 h-8 rounded-full font-bold text-white flex items-center justify-center"
              style={{ background: 'hsl(252,60%,24%)', border: '1px solid hsl(252,50%,35%)' }}>+</button>
          </div>
        </div>
      </div>

      {/* Network */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <p className="text-white font-semibold text-sm mb-3">Choose your network</p>
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_NETWORKS.map(n => (
            <button key={n.id} onClick={() => setNetwork(n.id)}
              className="p-3 rounded-lg text-left transition-all flex items-center gap-3"
              style={network === n.id
                ? { border: `1.5px solid ${n.color}`, background: `${n.color}18` }
                : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: n.color }} />
              <span className="text-white text-sm font-semibold">{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ITC special deal banner */}
      <div className="rounded-xl p-4 mb-4 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, rgba(89,27,255,0.18) 0%, rgba(249,69,128,0.12) 100%)', border: '1.5px solid rgba(89,27,255,0.4)' }}>
        <img src="/itc-logo-mark.png" alt="ITC" className="w-10 h-10 rounded-lg flex-shrink-0 object-contain" />
        <div>
          <p className="text-white font-bold text-sm mb-0.5">ITC Unlimited Data Deal</p>
          <p className="text-white/60 text-xs">Every SIM comes with unlimited calls, texts & data — no throttling, no fair use caps. Exclusive rates through ITC's network agreements.</p>
        </div>
      </div>

      {/* Contract term */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
        <p className="text-white font-semibold text-sm mb-3">Contract length</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ val: 36, label: '36 months', sub: 'Best value' }, { val: 12, label: '12 months', sub: 'Billed upfront' }].map(t => (
            <button key={t.val} onClick={() => setTerm(t.val)}
              className="p-3 rounded-lg text-left transition-all"
              style={term === t.val
                ? { border: '1.5px solid #591bff', background: 'rgba(89,27,255,0.15)' }
                : { border: '1px solid hsl(252,50%,32%)', background: 'transparent' }}>
              <p className="text-white text-xs font-semibold">{t.label}</p>
              <p className="text-white/40 text-[10px]">{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(89,27,255,0.12)', border: '1px solid rgba(89,27,255,0.4)' }}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/60">{sims} SIM{sims > 1 ? 's' : ''} × £{MOBILE_SIM_PRICE}/mo</span>
          <span className="text-white font-semibold">£{monthlyTotal.toFixed(2)}/mo</span>
        </div>
        {term === 12 ? (
          <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid rgba(89,27,255,0.3)' }}>
            <span className="text-white/80 font-semibold">12-month total (upfront)</span>
            <span className="text-white font-bold">£{upfront12.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid rgba(89,27,255,0.3)' }}>
            <span className="text-white/80 font-semibold">Monthly total</span>
            <span className="text-white font-bold">£{monthlyTotal.toFixed(2)}/mo</span>
          </div>
        )}
        <p className="text-white/35 text-[10px] mt-2">All prices ex. VAT · {term}-month contract</p>
      </div>

      <button onClick={handleContinue} className="itc-gradient-btn w-full py-3.5 rounded-xl font-semibold text-white text-base">
        Continue →
      </button>
    </div>
  )
}

function CallbackForm({ journey, onBack }: { journey: Journey; onBack: () => void }) {
  const labels: Record<Journey, { title: string; desc: string }> = {
    voip:     { title: 'VoIP Phone System', desc: 'Tell us about your setup and we\'ll build a quote for you.' },
    mobile:   { title: 'Mobile',            desc: 'Tell us what you need and we\'ll come back with options.' },
    pstn:     { title: 'Landline Migration', desc: 'We\'ll help you migrate before the 2027 PSTN switch-off.' },
    internet: { title: 'Internet',           desc: '' },
  }
  const { title, desc } = labels[journey]

  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [notes, setNotes]     = useState('')
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit() {
    if (!name || !email || !phone) return
    setSending(true)
    try {
      await fetch('/api/connectwise/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            contactName: name,
            contactEmail: email,
            contactPhone: phone,
            companyName: name,
            companyNumber: '',
            sitePostcode: '',
            siteAddressLine1: '',
            siteCity: '',
            selectedProducts: [],
            monthlyTotal: 0,
            annualTotal: 0,
            term: 36,
            notes: `[${title} enquiry] ${notes}`,
          }
        })
      })
    } catch {}
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-white font-bold text-lg mb-2">We'll be in touch soon</p>
        <p className="text-white/50 text-sm mb-6">One of the ITC team will call you within 1 business day to discuss your {title.toLowerCase()} requirements.</p>
        <button onClick={onBack} className="text-white/50 text-sm hover:text-white transition-colors">← Back to services</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={onBack} className="text-white/40 text-sm hover:text-white transition-colors mb-5 flex items-center gap-1">
        ← Back
      </button>
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      <p className="text-white/45 text-sm mb-6">{desc}</p>

      <div className="flex flex-col gap-3">
        {[
          { label: 'Your name',         val: name,  set: setName,  type: 'text',  ph: 'Full name' },
          { label: 'Email address',      val: email, set: setEmail, type: 'email', ph: 'your@email.com' },
          { label: 'Best phone number',  val: phone, set: setPhone, type: 'tel',   ph: '07700 000000' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs text-white/50 mb-1">{f.label}</label>
            <input
              type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
              placeholder={f.ph}
              className="w-full px-3 py-3 rounded-lg text-sm text-white"
              style={{ background: 'hsl(252,60%,10%)', border: '1px solid hsl(252,50%,35%)', outline: 'none' }}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-white/50 mb-1">Anything specific? (optional)</label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder={journey === 'voip' ? 'e.g. 5 users, need handsets, currently on BT' : journey === 'mobile' ? 'e.g. 10 SIMs on O2, need data-heavy plan' : 'e.g. 2 analogue lines, want to keep our number'}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white resize-none"
            style={{ background: 'hsl(252,60%,10%)', border: '1px solid hsl(252,50%,35%)', outline: 'none' }}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={sending || !name || !email || !phone}
        className="itc-gradient-btn w-full py-3 rounded-xl font-semibold text-white mt-4 disabled:opacity-40"
      >
        {sending ? 'Sending...' : 'Request a Callback →'}
      </button>
    </div>
  )
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS         = ['Address', 'Company', 'Products', 'Quote', 'Sign', 'Payment', 'Confirm']
const STEPS_VOIP    = ['Contact', 'Company', 'Quote', 'Sign', 'Payment', 'Confirm']

// Maps VoIP display index → real step index (skips step 2)
const VOIP_STEP_MAP = [0, 1, 3, 4, 5, 6]

function StepIndicator({ current, journey }: { current: number; journey: Journey | null }) {
  const skipProducts = journey === 'voip' || journey === 'mobile'
  const steps   = skipProducts ? STEPS_VOIP : STEPS
  const display = skipProducts ? VOIP_STEP_MAP.indexOf(current) : current

  return (
    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-10 overflow-x-auto">
      {steps.map((label, i) => {
        const isActive = i === display
        const isDone   = i < display
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all"
                style={{
                  background: isDone ? '#f94580' : isActive ? '#591bff' : 'hsl(252, 60%, 18%)',
                  borderColor: isDone ? '#f94580' : isActive ? '#591bff' : 'hsl(252, 50%, 30%)',
                  color: isDone || isActive ? 'white' : 'hsl(260, 20%, 55%)',
                }}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block" style={{ color: isActive ? '#f94580' : 'hsl(260, 20%, 55%)', fontWeight: isActive ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-10 sm:w-16 h-0.5 mx-1 mb-5" style={{ background: i < display ? "#f94580" : "hsl(252, 50%, 28%)" }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Tier Cards ──────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'core',
    name: 'Velocity Core',
    range: '100–200 Mbps',
    speeds: [100, 150, 200],
    badge: null,
    positioning: 'Reliable business connectivity for day-to-day operations.',
    bullets: ['Small offices', 'Light cloud usage', 'VoIP + browsing', 'Retail, clinics, agencies'],
    color: '#7be7ff',
    glow: 'rgba(123,231,255,0.12)',
    border: 'rgba(123,231,255,0.3)',
  },
  {
    id: 'growth',
    name: 'Velocity Growth',
    range: '330–500 Mbps',
    speeds: [330, 500],
    badge: 'Most Popular',
    positioning: 'High-capacity connectivity built for scaling teams.',
    bullets: ['10–40 staff', 'Cloud-first teams', 'Heavy Teams / Zoom', 'CRM + file sync'],
    color: '#f94580',
    glow: 'rgba(249,69,128,0.12)',
    border: 'rgba(249,69,128,0.5)',
  },
  {
    id: 'pro',
    name: 'Velocity Pro',
    range: '1–2 Gbps',
    speeds: [900, 1000, 2000],
    badge: null,
    positioning: 'Enterprise-grade performance with priority SLA options.',
    bullets: ['40+ staff', 'High upload demand', 'Multi-site', 'Hosted services'],
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.3)',
  },
]

function TierCards({ products }: { products: Product[] }) {
  const TIER_RANGES = [
    { id: 'core',   min: 50,   max: 249  },
    { id: 'growth', min: 250,  max: 999  },
    { id: 'pro',    min: 1000, max: 99999 },
  ]

  function productsForTier(tierId: string) {
    const range = TIER_RANGES.find(r => r.id === tierId)!
    return products
      .filter(p => (p.downloadMbps || 0) >= range.min && (p.downloadMbps || 0) <= range.max)
      .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
      .sort((a, b) => (a.downloadMbps || 0) - (b.downloadMbps || 0))
  }

  function speedLabel(mbps: number) {
    if (mbps >= 1000) {
      const g = mbps / 1000
      return `${Number.isInteger(g) ? g : g.toFixed(1)} Gbps`
    }
    return `${mbps} Mbps`
  }

  const activeTiers = TIERS.filter(t => productsForTier(t.id).length > 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {activeTiers.map(tier => {
        const tierProducts = productsForTier(tier.id)
        const speeds = tierProducts.map(p => p.downloadMbps || 0)
        const isFeatured = tier.badge === 'Most Popular'

        const accentDark = tier.id === 'growth' ? '#be185d' : tier.id === 'core' ? '#0e7490' : '#6d28d9'

        return (
          <div
            key={tier.id}
            className="rounded-2xl flex flex-col relative"
            style={{
              background: 'white',
              border: isFeatured ? '2px solid transparent' : '1px solid #e5e7eb',
              boxShadow: isFeatured ? '0 8px 32px rgba(249,69,128,0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
              marginTop: isFeatured ? '14px' : '0',
            }}
          >
            {isFeatured && (
              <div style={{
                position: 'absolute', inset: -2, borderRadius: '1.1rem', zIndex: -1,
                background: 'linear-gradient(135deg, #f94580, #591bff)',
              }} />
            )}
            {isFeatured && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #f94580, #591bff)',
                zIndex: 2, whiteSpace: 'nowrap',
              }} className="px-3 py-1 rounded-full text-xs font-semibold text-white">
                Most Popular
              </div>
            )}

            <div className="rounded-2xl flex flex-col flex-1 p-5" style={{ background: 'white', position: 'relative', zIndex: 1 }}>
              <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Visby CF Bold, sans-serif', letterSpacing: '-0.02em', color: '#0f0a2e' }}>{tier.name}</h3>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-sm font-semibold" style={{ color: accentDark }}>{speedLabel(speeds[0])}</span>
                {speeds.length > 1 && <span className="text-sm" style={{ color: accentDark }}>– {speedLabel(speeds[speeds.length - 1])}</span>}
              </div>

              <p className="text-xs mb-4 leading-relaxed" style={{ color: '#6b7280' }}>{tier.positioning}</p>

              <div className="w-full h-px mb-4" style={{ background: '#f3f4f6' }} />

              <ul className="space-y-2 flex-1 mb-2">
                {tier.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill={accentDark} fillOpacity="0.1"/>
                      <path d="M4 7l2 2 4-4" stroke={accentDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 0: Availability Checker ────────────────────────────────────────────

function Step0({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [postcode, setPostcode] = useState(order.sitePostcode || '')
  const [addresses, setAddresses] = useState<ZenAddress[]>([])
  const [selectedAddr, setSelectedAddr] = useState<ZenAddress | null>(order.selectedAddress || null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingAddr, setLoadingAddr] = useState(false)
  const [loadingProds, setLoadingProds] = useState(false)
  const [addrError, setAddrError] = useState('')
  const [prodError, setProdError] = useState('')
  const [checked, setChecked] = useState(false)

  async function checkPostcode() {
    const pc = postcode.trim().toUpperCase()
    if (!pc) return
    setLoadingAddr(true)
    setAddrError('')
    setAddresses([])
    setSelectedAddr(null)
    setProducts([])
    setChecked(false)
    try {
      const res = await fetch(`/api/zen/address?postcode=${encodeURIComponent(pc)}`)
      const data = await res.json()
      if (!data.addresses?.length) { setAddrError('No addresses found for this postcode.'); setLoadingAddr(false); return }
      setAddresses(data.addresses)
      if (data.addresses.length === 1) selectAddress(data.addresses[0], pc)
    } catch { setAddrError('Could not look up postcode. Please try again.') }
    setLoadingAddr(false)
  }

  async function selectAddress(addr: ZenAddress, pc?: string) {
    setSelectedAddr(addr)
    setLoadingProds(true)
    setProdError('')
    setProducts([])
    setChecked(false)
    try {
      // If no UPRN, look it up via EPC register
      let uprn = addr.uprn
      if (!uprn) {
        const epcRes = await fetch(`/api/epc/uprn?postcode=${encodeURIComponent(pc || postcode)}&address=${encodeURIComponent(addr.displayAddress)}`)
        const epcData = await epcRes.json()
        uprn = epcData.uprn || ''
      }
      const availParam = uprn ? `uprn=${encodeURIComponent(uprn)}` : `goldAddressKey=${encodeURIComponent(addr.goldAddressKey)}`
      const res = await fetch(`/api/zen/availability?${availParam}`)
      const data = await res.json()
      setProducts(data.products || [])
      setChecked(true)
      setOrder({
        sitePostcode: pc || postcode.trim().toUpperCase(),
        selectedAddress: addr,
        zenAvailabilityRef: data.availabilityRef,
      })
    } catch { setProdError('Could not check availability. Please try again.') }
    setLoadingProds(false)
  }

  const broadband = products
    .filter(p => ['fttp','fttc','sogea','gfast','adsl'].includes(p.type))
    .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
  const hasProducts = broadband.length > 0

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-6 px-3 py-2 rounded-lg"
        style={{ border: '1px solid hsl(252,50%,32%)', background: 'hsl(252,60%,16%)' }}>
        ← Back
      </button>
      <div className="text-center mb-6">
        <p className="text-base font-semibold text-white/75">Enter the postcode you want to check, to see if ITC services are available to you!</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={postcode}
          onChange={e => { setPostcode(e.target.value.toUpperCase()); setChecked(false); setProducts([]); setAddresses([]); setSelectedAddr(null); setOrder({ selectedAddress: undefined }) }}
          onKeyDown={e => e.key === 'Enter' && checkPostcode()}
          placeholder="e.g. BD1 1AA"
          maxLength={8}
          className="flex-1 rounded-xl px-4 py-3 text-base text-white placeholder-purple-400 font-semibold tracking-widest"
          style={{ background: 'hsl(252, 60%, 18%)', border: '1px solid hsl(252, 50%, 35%)' }}
        />
        <button
          onClick={checkPostcode}
          disabled={loadingAddr || postcode.trim().length < 5}
          className="itc-gradient-btn px-6 py-3 rounded-xl font-semibold text-white text-base disabled:opacity-40"
        >
          {loadingAddr ? 'Checking...' : 'Check'}
        </button>
      </div>

      {addrError && <p className="text-red-400 text-sm mb-4">{addrError}</p>}

      {addresses.length > 1 && !selectedAddr && (
        <div className="mb-4">
          <p className="text-sm mb-2 text-white/55">Select your address ({addresses.length} found):</p>
          <div className="rounded-xl overflow-y-auto" style={{ border: '1px solid hsl(252, 50%, 28%)', maxHeight: '280px' }}>
            {addresses.map((a, i) => (
              <button
                key={a.uprn || a.goldAddressKey}
                onClick={() => selectAddress(a, postcode.trim().toUpperCase())}
                className="w-full text-left px-4 py-3 text-sm text-white transition-colors"
                style={{ borderTop: i > 0 ? '1px solid hsl(252, 50%, 25%)' : 'none', background: 'transparent' }}
                onMouseOver={e => (e.currentTarget.style.background = 'hsl(260, 80%, 22%)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                {a.displayAddress}
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingProds && (
        <div className="text-center py-8">
          <div className="text-purple-400 text-sm animate-pulse">Checking availability at your address...</div>
        </div>
      )}

      {prodError && <p className="text-red-400 text-sm mb-4">{prodError}</p>}

      {checked && (
        <div className="mt-2">
          <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(89,27,255,0.15)', border: '1px solid rgba(89,27,255,0.4)' }}>
            <p className="text-white font-bold text-lg mb-1">Great News!</p>
            <p className="text-white/75 text-sm mb-5">ITC services are available at your address.</p>
            <button
              onClick={onNext}
              className="itc-gradient-btn px-8 py-3 rounded-xl font-semibold text-white text-base"
            >
              Explore Services →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 1: Installation Address + Contact Info ─────────────────────────────

function Step1({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const emailValid = !order.contactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.contactEmail)
  const canContinue = order.contactName && order.contactEmail && emailValid

  const contactFields: { label: string; key: keyof OrderState; type: string; placeholder: string; validate?: (v: string) => boolean; error?: string }[] = [
    { label: 'Contact Name', key: 'contactName', type: 'text', placeholder: 'Full name' },
    { label: 'Contact Email', key: 'contactEmail', type: 'email', placeholder: 'email@company.com', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), error: 'Enter a valid email address' },
    { label: 'Contact Phone', key: 'contactPhone', type: 'tel', placeholder: '07700 000000' },
  ]

  function renderField({ label, key, type, placeholder, validate, error }: typeof contactFields[0]) {
    const val = String((order as unknown as Record<string, string>)[key] || '')
    const touched = val.length > 0
    const isInvalid = touched && validate && !validate(val)
    return (
      <div key={key}>
        <label className="block text-sm font-semibold text-white/75 mb-1">{label}</label>
        <input
          type={type}
          value={val}
          onChange={e => {
            let v = e.target.value
            if (key === 'contactPhone') v = v.replace(/[^\d\s\+\(\)\-]/g, '')
            if (key === 'sitePostcode') v = v.toUpperCase()
            setOrder({ [key]: v })
          }}
          placeholder={placeholder}
          className="w-full rounded-lg px-4 py-3 text-base focus:outline-none text-white"
          style={{ background: 'hsl(252, 60%, 18%)', border: isInvalid ? '1px solid #f94580' : '1px solid hsl(252, 50%, 30%)' }}
        />
        {isInvalid && error && <p className="text-xs mt-1 text-[#f94580]">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Installation Address</h2>
      <p className="text-white/55 text-sm mb-6">Confirm where you&apos;d like the service installed and your contact details.</p>

      {/* Address from availability check */}
      {order.selectedAddress && (
        <>
          <div className="rounded-xl p-4 mb-2" style={{ background: 'hsl(252, 60%, 16%)', border: '1px solid hsl(252, 50%, 28%)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Installation Address</p>
            <p className="text-white font-semibold text-sm">{order.selectedAddress.displayAddress}</p>
            <p className="text-white/40 text-xs mt-0.5">{order.sitePostcode}</p>
          </div>
          <p className="text-xs text-white/40 mb-4">
            Not the right installation address?{' '}
            <button onClick={onBack} className="text-[#f94580] hover:underline focus:outline-none">click here to start again</button>
          </p>
        </>
      )}

      {/* Contact info */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-3">Your Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{contactFields.map(renderField)}</div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-6 py-4 rounded-xl font-semibold text-white/60 text-base hover:text-white transition-colors"
          style={{ border: '1px solid hsl(252, 50%, 30%)' }}>
          ← Back
        </button>
        <button onClick={onNext} disabled={!canContinue}
          className="itc-gradient-btn flex-1 py-4 rounded-xl font-semibold text-white text-base disabled:opacity-40">
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Company Details ──────────────────────────────────────────────────

function Step2({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const bizType = order.businessType || 'ltd'
  const [query, setQuery] = useState(order.companyName || '')
  const [suggestion, setSuggestion] = useState<CompanyResult | null>(null)
  const [searching, setSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const BIZ_TYPES = [
    { id: 'ltd',          label: 'Limited Company' },
    { id: 'sole_trader',  label: 'Sole Trader' },
    { id: 'partnership',  label: 'Partnership' },
  ] as const

  function switchType(t: typeof bizType) {
    setOrder({ businessType: t, companyName: '', companyNumber: '', companyStatus: '', authorisedToSign: false })
    setQuery('')
    setSuggestion(null)
  }

  async function fetchSuggestion(q: string) {
    if (q.length < 2) { setSuggestion(null); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/companies-house?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestion(data.items?.find((i: CompanyResult) => i.company_status === 'active') || null)
    } catch { setSuggestion(null) }
    setSearching(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setSuggestion(null)
    if (bizType === 'ltd') {
      setOrder({ companyName: '', companyNumber: '', companyStatus: '', authorisedToSign: false })
      if (searchTimer.current) clearTimeout(searchTimer.current)
      searchTimer.current = setTimeout(() => fetchSuggestion(val), 300)
    } else {
      setOrder({ companyName: val })
    }
  }

  async function acceptSuggestion(s: CompanyResult) {
    const ref = generateCompanyRef(s.title, s.date_of_creation || '')
    setQuery(s.title)
    setOrder({
      companyName: s.title,
      companyNumber: s.company_number,
      companyReference: ref,
      incorporatedDate: s.date_of_creation || '',
      companyStatus: s.company_status || '',
    })
    setSuggestion(null)
    try {
      const res = await fetch(`/api/companies-house/number?number=${s.company_number}`)
      const data = await res.json()
      setOrder({ registeredAddress: data.registered_office_address || {} })
    } catch {}
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter') && suggestion && !order.companyName) {
      e.preventDefault()
      acceptSuggestion(suggestion)
    }
    if (e.key === 'Escape') setSuggestion(null)
  }

  const ghostText = bizType === 'ltd' && suggestion && suggestion.title.toLowerCase().startsWith(query.toLowerCase())
    ? suggestion.title.slice(query.length) : ''

  const canContinue = bizType === 'ltd'
    ? order.companyName && order.companyNumber && order.companyStatus === 'active' && order.authorisedToSign
    : order.companyName && order.authorisedToSign

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Business Details</h2>
      <p className="text-white/55 text-sm mb-5">Tell us about your business so we can set up your account correctly.</p>

      {/* Business type toggle */}
      <div className="flex gap-2 mb-6">
        {BIZ_TYPES.map(t => (
          <button key={t.id} onClick={() => switchType(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={bizType === t.id
              ? { background: 'rgba(89,27,255,0.25)', border: '1.5px solid #591bff', color: 'white' }
              : { background: 'transparent', border: '1px solid hsl(252,50%,30%)', color: 'rgba(255,255,255,0.45)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ltd — Companies House search */}
      {bizType === 'ltd' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-white/75 mb-1">Company Name</label>
          <div className="relative">
            <input
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => { if (suggestion && !order.companyName) acceptSuggestion(suggestion) }}
              placeholder="e.g. ITC Telecoms Ltd"
              autoComplete="off"
              className="w-full rounded-lg px-4 py-3 text-base text-white placeholder-purple-400 focus:outline-none relative z-10"
              style={{ background: 'hsl(252, 60%, 18%)', border: '1px solid hsl(252, 50%, 30%)', caretColor: 'white' }}
            />
            <div aria-hidden="true" className="absolute inset-0 px-4 py-3 text-base pointer-events-none flex items-center overflow-hidden rounded-lg z-20" style={{ fontFamily: 'inherit' }}>
              <span className="invisible whitespace-pre">{query}</span>
              <span style={{ color: 'rgba(192,132,252,0.7)' }}>{ghostText}</span>
            </div>
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                <div className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.6)' }} />
              </div>
            )}
          </div>
          {suggestion && !order.companyName && (
            <p className="text-xs mt-1.5 pl-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Tab to accept · {suggestion.company_number} · {suggestion.registered_office_address?.postal_code}
            </p>
          )}
          {order.companyName && (
            <div className="rounded-lg p-3 mt-2 text-xs flex items-center gap-2" style={{ background: 'hsl(252, 60%, 16%)', border: '1px solid hsl(252, 50%, 28%)' }}>
              <span className="text-green-400 text-sm">✓</span>
              <span className="text-white/75">{order.companyName} · {order.companyNumber} · <span className={order.companyStatus === 'active' ? 'text-green-400' : 'text-red-400'}>{order.companyStatus?.toUpperCase()}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Sole trader / Partnership — free text */}
      {bizType !== 'ltd' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-white/75 mb-1">
            {bizType === 'sole_trader' ? 'Your Trading Name' : 'Partnership Name'}
          </label>
          <input
            value={query}
            onChange={handleChange}
            placeholder={bizType === 'sole_trader' ? 'e.g. J Smith Plumbing' : 'e.g. Smith & Jones Consulting'}
            className="w-full rounded-lg px-4 py-3 text-base text-white placeholder-purple-400 focus:outline-none"
            style={{ background: 'hsl(252, 60%, 18%)', border: '1px solid hsl(252, 50%, 30%)', caretColor: 'white' }}
          />
          {bizType === 'sole_trader' && (
            <p className="text-xs mt-1.5 pl-1 text-white/35">Sole traders are not verified against Companies House</p>
          )}
        </div>
      )}

      {/* Declaration */}
      {((bizType === 'ltd' && order.companyName && order.companyStatus === 'active') || (bizType !== 'ltd' && order.companyName)) && (
        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-4 mb-6"
          style={{ background: 'hsl(252, 60%, 16%)', border: `1px solid ${order.authorisedToSign ? 'rgba(89,27,255,0.6)' : 'hsl(252, 50%, 28%)'}` }}>
          <input
            type="checkbox"
            checked={order.authorisedToSign || false}
            onChange={e => setOrder({ authorisedToSign: e.target.checked })}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[#591bff]"
          />
          <span className="text-sm text-white/75 leading-relaxed">
            {bizType === 'ltd'
              ? <>I confirm that I am <strong className="text-white">authorised to sign</strong> on behalf of <strong className="text-white">{order.companyName}</strong> and that the information provided is accurate.</>
              : <>I confirm that I am the <strong className="text-white">owner or authorised representative</strong> of <strong className="text-white">{order.companyName}</strong> and that the information provided is accurate.</>
            }
          </span>
        </label>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-6 py-4 rounded-xl font-semibold text-white/60 text-base hover:text-white transition-colors"
          style={{ border: '1px solid hsl(252, 50%, 30%)' }}>
          ← Back
        </button>
        <button onClick={onNext} disabled={!canContinue}
          className="itc-gradient-btn flex-1 py-4 rounded-xl font-semibold text-white text-base disabled:opacity-40">
          Continue →
        </button>
      </div>
    </div>
  )
}

function Step3({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [selectedAddress] = useState<ZenAddress | null>(order.selectedAddress || null)
  const [products, setProducts] = useState<Product[]>([])
  const [availRef, setAvailRef] = useState<string | null>(order.zenAvailabilityRef || null)
  const [phase] = useState<'products'>('products')
  const [loading, setLoading] = useState(false)
  const [voipSeats, setVoipSeats] = useState(1)
  const [mobileSims, setMobileSims] = useState(1)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [selectedTerm, setSelectedTerm] = useState(order.leaseLine?.term || 36)

  // Load products on mount using the address from Step 0
  useEffect(() => {
    if (!order.selectedAddress) return
    if (products.length > 0) return
    setLoading(true)
    const addr = order.selectedAddress
    const uprn = addr.uprn
    const loadProducts = async () => {
      let resolvedUprn = uprn
      if (!resolvedUprn) {
        try {
          const epcRes = await fetch(`/api/epc/uprn?postcode=${encodeURIComponent(order.sitePostcode)}&address=${encodeURIComponent(addr.displayAddress)}`)
          const epcData = await epcRes.json()
          resolvedUprn = epcData.uprn || ''
        } catch {}
      }
      const uprnParam = resolvedUprn ? `uprn=${encodeURIComponent(resolvedUprn)}` : `goldAddressKey=${encodeURIComponent(addr.goldAddressKey)}`
      const res = await fetch(`/api/zen/availability?${uprnParam}`)
      if (!res.ok) throw new Error(`Availability API returned ${res.status}`)
      const data = await res.json()
      const zenProducts: Product[] = data.products || []
      const broadband = zenProducts.filter((p: Product) => ['fttp','fttc','sogea','gfast','adsl'].includes(p.type))
      if (broadband.length === 0 && !data.availabilityReference) {
        setProducts([{ type: 'lease_line', name: '__unresolvable__', monthlyCost: null, setupFee: null, available: false, requiresCallback: true }])
      } else {
        const valid = zenProducts.filter((p: Product) =>
          !['fttp','fttc','sogea','gfast','adsl'].includes(p.type) ||
          (p.downloadMbps !== p.uploadMbps && (p.uploadMbps || 0) > 0)
        )
        const bb = valid.filter((p: Product) => ['fttp','fttc','sogea','gfast','adsl'].includes(p.type))
        const addons = valid.filter((p: Product) => !['fttp','fttc','sogea','gfast','adsl'].includes(p.type))
        const targets = [1000, 550, 115]
        const picked: Product[] = []
        const sorted = [...bb].sort((a, b) => (b.downloadMbps || 0) - (a.downloadMbps || 0))
        for (const target of targets) {
          const remaining = sorted.filter(p => !picked.includes(p))
          if (!remaining.length) break
          picked.push(remaining.reduce((best, p) =>
            Math.abs((p.downloadMbps || 0) - target) < Math.abs((best.downloadMbps || 0) - target) ? p : best
          ))
        }
        picked.sort((a, b) => (b.downloadMbps || 0) - (a.downloadMbps || 0))
        // Assign ITC prices by tier (36-month contract): fastest=£87.99, mid=£79.99, entry=£49.99
        const ITC_PRICES = [87.99, 79.99, 49.99]
        const pricedPicked = picked.map((p, i) => ({ ...p, monthlyCost: ITC_PRICES[i] ?? p.monthlyCost, setupFee: 0 }))
        setProducts([...pricedPicked, ...addons,
          { type: 'lease_line', name: 'Managed Fibre', downloadMbps: 200, uploadMbps: 1000, monthlyCost: null, setupFee: null, available: true },
          { type: 'voip', name: 'VoIP Seat', monthlyCost: 8.00 * MARGIN, setupFee: 25.00, available: true },
          { type: 'mobile', name: 'O2 Unlimited SIM', monthlyCost: 15.00 * MARGIN, setupFee: 0, available: true },
        ])
      }
      setAvailRef(data.availabilityReference || null)
      setLoading(false)
    }
    loadProducts().catch(() => {
      setProducts([{ type: 'lease_line', name: '__unresolvable__', monthlyCost: null, setupFee: null, available: false, requiresCallback: true }])
      setLoading(false)
    })
  }, [order.selectedAddress])




  function toggle(key: string, type: string) {
    setSelected(s => {
      const isBroadband = !['voip', 'mobile', 'lease_line'].includes(type)
      if (isBroadband) {
        // Radio: deselect all broadband, select only this one (or deselect if already selected)
        const alreadySelected = s[key]
        const cleared: Record<string, boolean> = {}
        Object.keys(s).forEach(k => {
          const p = products.find(p => productKey(p) === k)
          if (p && !['voip', 'mobile', 'lease_line'].includes(p.type)) cleared[k] = false
          else cleared[k] = s[k]
        })
        return { ...cleared, [key]: !alreadySelected }
      }
      // VoIP / Mobile / Lease line: toggle freely
      return { ...s, [key]: !s[key] }
    })
  }
  function productKey(p: Product) { return `${p.name}-${p.downloadMbps ?? p.type}` }


  function buildSelected(): SelectedProduct[] {
    const items: SelectedProduct[] = products
      .filter(p => selected[productKey(p)])
      .map(p => {
        if (p.type === 'lease_line') {
          return { type: p.type, name: 'Managed Fibre (Leased Line)', quantity: 1, unitMonthly: 0, monthlyTotal: 0, requiresCallback: true }
        }
        const qty = p.type === 'voip' ? voipSeats : p.type === 'mobile' ? mobileSims : 1
        const unitMonthly = p.monthlyCost || 0
        return { type: p.type, name: p.name, quantity: qty, unitMonthly, monthlyTotal: unitMonthly * qty }
      })
    if (selected['sim-offer']) {
      items.push({ type: 'mobile', name: 'Unlimited Data SIM', quantity: 1, unitMonthly: 20, monthlyTotal: 20 })
    }
    return items
  }

  function handleProductsNext() {
    const sel = buildSelected()
    setOrder({
      selectedProducts: sel,
      requiresCallback: products.some(p => p.type === 'lease_line' && selected[productKey(p)]) || false,
      leaseLine: undefined,
    })
    onNext()
  }

  const hasSelection = Object.values(selected).some(Boolean)
  const leaseLineReady = true // lease line goes to callback, no quote needed

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 rounded-full animate-spin mb-3" style={{ borderColor: "hsl(252, 50%, 28%)", borderTopColor: "#f94580" }} />
        <p className="text-purple-300 text-sm">Checking availability at {selectedAddress?.displayAddress}...</p>
      </div>
    )
  }

  // ── Products ─────────────────────────────────────────────────────────────────
  if (phase === 'products') {
    const broadband = products.filter(p => ['fttp','fttc','sogea','gfast','adsl'].includes(p.type) && p.name !== '__unresolvable__')
    const addons = products.filter(p => ['voip','mobile','lease_line'].includes(p.type))
    const isUnresolvable = products.length === 1 && products[0].name === '__unresolvable__'

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold">Select Services</h2>
        </div>
        <p className="text-sm mb-5 text-white/40">{selectedAddress?.displayAddress}</p>

        {isUnresolvable ? (
          <div className="rounded-xl p-6 mb-6 text-center" style={{ background: 'rgba(249,69,128,0.08)', border: '1px solid rgba(249,69,128,0.3)' }}>
            <p className="text-white font-semibold mb-2">We couldn't automatically check availability for this address</p>
            <p className="text-purple-300 text-sm mb-4">An ITC advisor will contact you within 1 business day to confirm what's available and provide a tailored quote.</p>
            <button onClick={handleProductsNext} className="itc-gradient-btn px-6 py-3 rounded-xl font-semibold text-white text-sm">Request a Callback →</button>
          </div>
        ) : (
          <>
            {/* Broadband */}
            {broadband.length > 0 && (
              <div className="mb-5">
                <div className="rounded-lg px-3 py-2 mb-3 flex items-center gap-2" style={{ background: 'rgba(123,231,255,0.08)', border: '1px solid rgba(123,231,255,0.2)' }}>
                  <span className="text-[#7be7ff] text-xs font-bold uppercase tracking-widest">✓ Full Fibre available at your address</span>
                </div>
                <div className="space-y-2">
                  {broadband.map(p => (
                    <div key={productKey(p)} onClick={() => toggle(productKey(p), p.type)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer transition-all"
                      style={selected[productKey(p)]
                        ? { border: '2px solid #f94580', background: 'rgba(249,69,128,0.08)' }
                        : { border: '1.5px solid hsl(252,50%,30%)', background: 'hsl(252,60%,16%)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: selected[productKey(p)] ? '#f94580' : 'hsl(252,50%,35%)', background: selected[productKey(p)] ? '#f94580' : 'transparent' }}>
                          {selected[productKey(p)] && <span className="text-white text-[9px] leading-none">✓</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{p.name}</p>
                          <p className="text-xs text-white/40">↓ {p.downloadMbps} / ↑ {p.uploadMbps} Mbps</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-white">{p.monthlyCost ? `£${p.monthlyCost.toFixed(2)}/mo` : 'POA'}</span>
                        {p.monthlyCost && <p className="text-[10px] text-white/30">36-month contract</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Offer: Unlimited SIM */}
            {(() => {
              const hasFibre = broadband.some(p => selected[productKey(p)])
              return (
                <div
                  onClick={() => hasFibre && toggle('sim-offer', 'mobile')}
                  className="rounded-xl p-4 mb-5 transition-all"
                  style={{
                    cursor: hasFibre ? 'pointer' : 'not-allowed',
                    opacity: hasFibre ? 1 : 0.4,
                    ...(selected['sim-offer']
                      ? { border: '2px solid #f94580', background: 'rgba(249,69,128,0.12)' }
                      : { border: '1.5px solid rgba(249,69,128,0.5)', background: 'linear-gradient(135deg, rgba(249,69,128,0.08), rgba(89,27,255,0.08))' })
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: selected['sim-offer'] ? '#f94580' : 'rgba(249,69,128,0.6)', background: selected['sim-offer'] ? '#f94580' : 'transparent' }}>
                        {selected['sim-offer'] && <span className="text-white text-[9px] leading-none">✓</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-semibold text-sm">Unlimited Data SIM</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#f94580,#591bff)', color: 'white' }}>🎁 Special Offer</span>
                        </div>
                        <p className="text-xs text-white/50">
                          {hasFibre ? 'Unlimited calls, texts & data. Perfect for your team on the go.' : 'Select a fibre package above to unlock this offer.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-white">£20.00/mo</span>
                      <p className="text-[10px] text-white/30">per SIM</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Add-ons</p>
                <div className="space-y-2">
                  {addons.map(p => (
                    <div key={productKey(p)} onClick={() => toggle(productKey(p), p.type)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer transition-all"
                      style={selected[productKey(p)]
                        ? { border: '2px solid #f94580', background: 'rgba(249,69,128,0.08)' }
                        : { border: '1.5px solid hsl(252,50%,30%)', background: 'hsl(252,60%,16%)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: selected[productKey(p)] ? '#f94580' : 'hsl(252,50%,35%)', background: selected[productKey(p)] ? '#f94580' : 'transparent' }}>
                          {selected[productKey(p)] && <span className="text-white text-[9px] leading-none">✓</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{p.name}</p>
                          {p.type === 'lease_line' && <p className="text-xs text-white/40">Quote on request</p>}
                          {p.type === 'voip' && <p className="text-xs text-white/40">Cloud phone system</p>}
                          {p.type === 'mobile' && <p className="text-xs text-white/40">O2 business SIM</p>}
                        </div>
                      </div>
                      {/* Qty controls */}
                      {p.type === 'voip' && selected[productKey(p)] && (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <input type="number" min={1} max={100} value={voipSeats}
                            onChange={e => setVoipSeats(Number(e.target.value))}
                            className="w-14 rounded px-2 py-1 text-sm text-white text-center" style={{ background: "hsl(252,60%,18%)", border: "1px solid hsl(252,50%,30%)" }} />
                          <span className="text-xs text-white/30">seats</span>
                        </div>
                      )}
                      {p.type === 'mobile' && selected[productKey(p)] && (
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <input type="number" min={1} max={500} value={mobileSims}
                            onChange={e => setMobileSims(Number(e.target.value))}
                            className="w-14 rounded px-2 py-1 text-sm text-white text-center" style={{ background: "hsl(252,60%,18%)", border: "1px solid hsl(252,50%,30%)" }} />
                          <span className="text-xs text-white/30">SIMs</span>
                        </div>
                      )}
                      {p.type === 'lease_line' && <span className="text-xs text-white/30">POA</span>}
                      {p.type === 'voip' && !selected[productKey(p)] && <span className="text-xs text-white/30">£{(8 * MARGIN).toFixed(2)}/seat</span>}
                      {p.type === 'mobile' && !selected[productKey(p)] && <span className="text-xs text-white/30">£{(15 * MARGIN).toFixed(2)}/SIM</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lease line callout */}
            {products.some(p => p.type === 'lease_line' && selected[productKey(p)]) && (
              <div className="rounded-lg px-4 py-3 mb-4 text-xs" style={{ background: 'rgba(249,69,128,0.08)', border: '1px solid rgba(249,69,128,0.3)', color: '#f94580' }}>
                📞 An ITC advisor will call within 1 business day to discuss leased line options and pricing.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={onBack}
                className="flex-1 py-4 rounded-xl font-semibold text-base text-purple-200" style={{ border: "1px solid hsl(252,50%,35%)", background: "hsl(252,60%,18%)" }}>← Back</button>
              <button onClick={handleProductsNext} disabled={!hasSelection}
                className="flex-1 py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn disabled:opacity-40">
                Get Quote →
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

}

// ─── Save Quote Panel ─────────────────────────────────────────────────────────

function SaveQuotePanel({ email, name, quoteRef, quoteSnapshot }: {
  email: string
  name: string
  quoteRef: string
  quoteSnapshot: Record<string, unknown>
}) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // 1. Create account + save quote server-side
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, quoteRef, quoteSnapshot }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      // 2. Sign in client-side to establish session in browser
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error('Account created but sign-in failed. Please go to /account and log in.')

      window.location.href = '/account'
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl p-4 mt-2" style={{ background: 'hsl(252, 60%, 16%)', border: '1px solid hsl(252, 50%, 28%)' }}>
      <p className="text-sm font-semibold text-white mb-1">Create a password to save your quote</p>
      <p className="text-xs text-white/55 leading-relaxed mb-3">
        We&apos;ll use <strong className="text-white/80">{email}</strong> as your login — just set a password.
      </p>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="Create a password (min. 8 characters)"
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white mb-3"
        style={{ background: 'hsl(252, 60%, 10%)', border: '1px solid hsl(252, 50%, 35%)', outline: 'none' }}
      />
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <button
        onClick={handleSave}
        disabled={loading}
        className="itc-gradient-btn w-full py-2.5 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Quote & Create Account →'}
      </button>
    </div>
  )
}

// ─── Step 4: Quote ────────────────────────────────────────────────────────────

function Step4({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [term, setTerm] = useState<number>(order.quoteTerm || 36)
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [saveExpanded, setSaveExpanded] = useState(false)

  const monthly = order.selectedProducts.reduce((sum, p) => sum + p.monthlyTotal, 0)
  const annual = monthly * term
  const quoteRef = order.quoteReference || generateQuoteRef()

  useEffect(() => {
    if (!order.quoteReference) {
      setOrder({ quoteReference: quoteRef, quoteTerm: term })
    }
  }, [])

  useEffect(() => {
    setOrder({ quoteTerm: term, monthlyTotal: monthly, annualTotal: annual })
  }, [term])

  async function emailQuote() {
    setSending(true)
    try {
      await fetch('/api/quote/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || 'preview',
          order: { ...order, quote_reference: quoteRef, monthly_total: monthly, annual_total: annual, quote_term_months: term },
        }),
      })
      setEmailSent(true)
      setOrder({ quoteSent: true })
    } catch {}
    setSending(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Your Quote</h2>
      <p className="text-sm mb-2 text-white/55">Ref: <strong>{quoteRef}</strong> · Valid 30 days</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-purple-200">Contract Term:</label>
        {[12, 36].map(t => (
          <button
            key={t}
            onClick={() => setTerm(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all"
            style={term === t ? { background: NAVY, borderColor: NAVY, color: 'white' } : { borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            {t}m
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid hsl(252, 50%, 28%)" }}>
        <table className="w-full text-sm text-white">
          <thead>
            <tr style={{ background: NAVY, color: 'white' }}>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit/mo</th>
              <th className="px-4 py-3 text-right">Total/mo</th>
            </tr>
          </thead>
          <tbody style={{ background: "hsl(252, 60%, 14%)" }}>
            {order.selectedProducts.map((p, i) => (
              <tr key={i} style={{ borderTop: "1px solid hsl(252, 50%, 28%)", background: "hsl(252, 60%, 14%)" }}>
                <td className="px-4 py-3">
                  {p.name}
                  {p.requiresCallback && <span className="ml-2 text-xs text-amber-600">(callback)</span>}
                </td>
                <td className="px-4 py-3 text-center">{p.quantity}</td>
                <td className="px-4 py-3 text-right">{p.unitMonthly ? `£${p.unitMonthly.toFixed(2)}` : 'POA'}</td>
                <td className="px-4 py-3 text-right">{p.monthlyTotal ? `£${p.monthlyTotal.toFixed(2)}` : 'POA'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid hsl(252, 50%, 28%)", background: "hsl(252, 60%, 16%)" }}>
              <td colSpan={3} className="px-4 py-3 font-bold text-right">Monthly Total</td>
              <td className="px-4 py-3 font-bold text-right" >£{monthly.toFixed(2)}</td>
            </tr>

          </tfoot>
        </table>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <button
          onClick={emailQuote}
          disabled={sending || emailSent}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          style={{ border: "1.5px solid #591bff", color: emailSent ? 'white' : '#7be7ff', background: emailSent ? '#591bff' : 'transparent' }}
        >
          {emailSent ? `✓ Quote sent to ${order.contactEmail}` : sending ? 'Sending...' : `📧 Email Quote to ${order.contactEmail}`}
        </button>
        <button
          onClick={() => setSaveExpanded(v => !v)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{ border: saveExpanded ? '1.5px solid #591bff' : '1.5px solid hsl(252,50%,35%)', color: saveExpanded ? 'white' : '#c4b8f0', background: saveExpanded ? 'rgba(89,27,255,0.15)' : 'transparent' }}
        >
          💾 Save Quote
        </button>

        {saveExpanded && (
          <SaveQuotePanel
            email={order.contactEmail}
            name={order.contactName}
            quoteRef={quoteRef}
            quoteSnapshot={{
              selectedProducts: order.selectedProducts,
              monthly,
              annual,
              term,
              companyName: order.companyName,
              siteAddressLine1: order.siteAddressLine1,
              siteCity: order.siteCity,
              sitePostcode: order.sitePostcode,
            }}
          />
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl font-semibold text-base text-purple-200" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-lg font-semibold text-white"
          style={{ background: NAVY }}
        >
          Proceed to Sign →
        </button>
      </div>
    </div>
  )
}

// ─── Step 5: E-Signature ──────────────────────────────────────────────────────

function Step5({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [signedName, setSignedName] = useState(order.signedName || '')
  const [authorised, setAuthorised] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(!!order.signedAt)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  async function handleSign() {
    setSigning(true)
    const signedAt = new Date().toISOString()
    const orderId = order.id || 'preview'
    const signedOrder = {
      quote_reference: order.quoteReference,
      quote_term_months: order.quoteTerm,
      company_name: order.companyName,
      company_number: order.companyNumber,
      company_reference: order.companyReference,
      registered_address: order.registeredAddress,
      contact_name: order.contactName,
      contact_email: order.contactEmail,
      contact_phone: order.contactPhone,
      site_postcode: order.sitePostcode,
      selected_products: order.selectedProducts,
      monthly_total: order.monthlyTotal,
      annual_total: order.annualTotal,
      signed_name: signedName,
      signed_at: signedAt,
    }
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, signedName, order: signedOrder }),
      })
      const data = await res.json()
      setOrder({ signedName, signedAt: data.signedAt || signedAt })
    } catch {
      setOrder({ signedName, signedAt })
    }
    setSigned(true)
    setSigning(false)
    // Auto-send signed copy by email
    setEmailStatus('sending')
    try {
      const emailRes = await fetch('/api/quote/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, order: signedOrder, signed: true }),
      })
      const emailData = await emailRes.json()
      setEmailStatus(emailData.success ? 'sent' : 'failed')
    } catch {
      setEmailStatus('failed')
    }
  }

  const canSign = signedName.trim().length > 2 && authorised && !signed

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Sign Agreement</h2>
      <p className="text-purple-300 text-sm mb-4">Please review and sign the service agreement below.</p>

      <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
          <div><span className="text-white/55">Company</span><br /><strong>{order.companyName}</strong></div>
          <div><span className="text-white/55">Quote Ref</span><br /><strong>{order.quoteReference}</strong></div>
          <div><span className="text-white/55">Monthly Total</span><br /><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div><span className="text-white/55">Contract</span><br /><strong>{order.quoteTerm} months</strong></div>
        </div>
      </div>

      <div className="rounded-lg p-4 mb-4 text-xs text-purple-200 max-h-40 overflow-y-auto leading-relaxed" style={{ background: "hsl(252, 60%, 16%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <strong className="text-white">Telecoms Service Agreement — Terms & Conditions</strong><br /><br />
        1. <strong>Service Provision.</strong> ITC Telecoms Ltd (&ldquo;the Provider&rdquo;) agrees to provide the telecommunications services specified in the quote (&ldquo;Services&rdquo;) to the customer named above (&ldquo;the Customer&rdquo;) subject to these terms.<br /><br />
        2. <strong>Contract Term & Billing.</strong> The minimum contract term is as specified in the quote. Monthly charges are invoiced in advance and collected via Direct Debit on the 1st of each month. Early termination fees apply equal to the remaining monthly charges in the contract term.<br /><br />
        3. <strong>Service Levels.</strong> The Provider will use reasonable endeavours to maintain service availability. Planned maintenance will be notified 48 hours in advance. The Provider&rsquo;s liability for service interruptions is limited to service credits as defined in the SLA.<br /><br />
        4. <strong>Fair Use.</strong> All services are subject to ITC Telecoms Fair Use Policy. Unlimited services apply to normal business use only.<br /><br />
        5. <strong>Data Protection.</strong> Both parties agree to comply with the UK GDPR and Data Protection Act 2018 in relation to any personal data processed under this agreement.<br /><br />
        6. <strong>Electronic Signature.</strong> This agreement is validly executed by electronic signature in accordance with the Electronic Communications Act 2000. The electronic signature below shall have the same legal effect as a handwritten signature.
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-white/75 mb-1">Type your full name to sign</label>
        <input
          value={signedName}
          onChange={e => setSignedName(e.target.value)}
          placeholder="Your full name"
          disabled={signed}
          className="w-full border rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ fontStyle: 'italic', fontSize: '16px' }}
        />
      </div>

      <label className="flex items-start gap-2 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={authorised}
          onChange={e => setAuthorised(e.target.checked)}
          disabled={signed}
          className="mt-0.5"
        />
        <span className="text-sm text-purple-200">
          I confirm I am authorised to sign on behalf of <strong>{order.companyName}</strong> and agree to the terms above.
        </span>
      </label>

      {signed && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "rgba(123, 231, 255, 0.1)", border: "1px solid rgba(123, 231, 255, 0.4)", color: "#7be7ff" }}>
          ✓ Signed by <strong>{order.signedName}</strong> on {new Date(order.signedAt).toLocaleDateString('en-GB')} at {new Date(order.signedAt).toLocaleTimeString('en-GB')} UTC<br />
          <span className="text-xs text-green-600">Electronic signature captured per Electronic Communications Act 2000</span>
        </div>
      )}

      {signed && (
        <div className="rounded-lg p-3 mb-4 flex items-center gap-3"
          style={{ background: "hsl(252,60%,16%)", border: "1px solid hsl(252,50%,28%)" }}>
          {emailStatus === 'sending' && (
            <><div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0" style={{ borderColor: 'hsl(252,50%,40%)', borderTopColor: '#7be7ff' }} />
            <p className="text-xs text-white/50">Sending signed copy to {order.contactEmail}...</p></>
          )}
          {emailStatus === 'sent' && (
            <><span className="text-green-400 flex-shrink-0">✓</span>
            <p className="text-xs text-white/60">Signed copy sent to <strong className="text-white">{order.contactEmail}</strong></p></>
          )}
          {emailStatus === 'failed' && (
            <><span className="text-amber-400 flex-shrink-0">⚠</span>
            <p className="text-xs text-white/60">Couldn&apos;t send email — your agreement is still valid. Contact us on 01274 952 123.</p></>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button onClick={onBack} disabled={signing} className="flex-1 py-3 rounded-xl font-semibold text-base text-purple-200 disabled:opacity-40" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
        {!signed ? (
          <button
            onClick={handleSign}
            disabled={!canSign || signing}
            className="flex-1 py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn disabled:opacity-40"
            style={{ background: NAVY }}
          >
            {signing ? 'Signing...' : '✍️ Sign Agreement'}
          </button>
        ) : (
          <button onClick={onNext} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ background: NAVY }}>
            Set Up Direct Debit →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step 6: Direct Debit ─────────────────────────────────────────────────────

function Step6({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [accountHolder, setAccountHolder] = useState(order.ddAccountHolder || order.contactName || '')
  const [sortCode, setSortCode] = useState(order.ddSortCode || '')
  const [accountNumber, setAccountNumber] = useState('')
  const [authorised, setAuthorised] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(order.ddConfirmed || false)
  const [error, setError] = useState('')

  function formatSortCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
  }

  async function handleSetup() {
    setError('')
    const cleanAcc = accountNumber.replace(/\s/g, '')
    if (!/^\d{8}$/.test(cleanAcc)) { setError('Account number must be 8 digits'); return }
    const cleanSort = sortCode.replace(/-/g, '')
    if (!/^\d{6}$/.test(cleanSort)) { setError('Enter a valid sort code (XX-XX-XX)'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/mandate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id || 'preview', accountHolder, sortCode, accountNumber: cleanAcc }),
      })
      const data = await res.json()
      if (data.success) {
        setOrder({ ddAccountHolder: accountHolder, ddSortCode: sortCode, ddAccountNumberLast4: data.last4, ddConfirmed: true })
        setConfirmed(true)
      } else {
        setError(data.error || 'Failed to set up Direct Debit')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const canSubmit = accountHolder && sortCode.length === 8 && accountNumber.replace(/\s/g, '').length === 8 && authorised && !confirmed

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Direct Debit Setup</h2>
      <p className="text-purple-300 text-sm mb-4">
        Monthly payment of <strong>£{order.monthlyTotal?.toFixed(2)}</strong> will be collected on the 1st of each month.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-semibold text-white/75 mb-1">Account Holder Name</label>
          <input
            value={accountHolder}
            onChange={e => setAccountHolder(e.target.value)}
            disabled={confirmed}
            placeholder="Name on bank account"
            className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-white/75 mb-1">Sort Code</label>
            <input
              value={sortCode}
              onChange={e => setSortCode(formatSortCode(e.target.value))}
              disabled={confirmed}
              placeholder="XX-XX-XX"
              className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/75 mb-1">Account Number</label>
            <input
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
              disabled={confirmed}
              placeholder="12345678"
              className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={authorised} onChange={e => setAuthorised(e.target.checked)} disabled={confirmed} className="mt-0.5" />
        <span className="text-sm text-purple-200">
          I authorise <strong>ITC Telecoms</strong> to collect payments of <strong>£{order.monthlyTotal?.toFixed(2)}/month</strong> by Direct Debit from my account.
        </span>
      </label>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800">
        🛡️ <strong>Direct Debit Guarantee</strong> — If an error is made in the payment of your Direct Debit, you are entitled to a full and immediate refund. You can cancel at any time by contacting your bank.
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>}

      {confirmed && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "rgba(123, 231, 255, 0.1)", border: "1px solid rgba(123, 231, 255, 0.4)", color: "#7be7ff" }}>
          ✓ Direct Debit authorised for account ending <strong>****{order.ddAccountNumberLast4}</strong>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button onClick={onBack} disabled={confirmed} className="flex-1 py-3 rounded-xl font-semibold text-base text-purple-200 disabled:opacity-40" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
        {!confirmed ? (
          <button
            onClick={handleSetup}
            disabled={!canSubmit || submitting}
            className="flex-1 py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn disabled:opacity-40"
            style={{ background: NAVY }}
          >
            {submitting ? 'Processing...' : 'Set Up Direct Debit'}
          </button>
        ) : (
          <button onClick={onNext} className="flex-1 py-3 rounded-lg font-semibold text-white" style={{ background: NAVY }}>
            Complete Order →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step 7: Confirmation ─────────────────────────────────────────────────────

function Step7({ order }: { order: OrderState }) {
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    // Fire ConnectWise sync in background
    fetch('/api/connectwise/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setSynced(true) })
      .catch(() => {})
  }, [])

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(123,231,255,0.15)' }}>
        <span className="text-4xl">✓</span>
      </div>

      <h2 className="text-2xl font-bold mb-2">Order Confirmed<span style={{ fontFamily: "'Manrope', sans-serif" }}>!</span></h2>
      <p className="text-gray-500 mb-1">Reference: <strong>{order.quoteReference}</strong></p>
      

      <div className="rounded-xl p-4 text-sm text-left mb-6" style={{ background: "hsl(252, 60%, 16%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-white/55">Company</span><strong>{order.companyName}</strong></div>
          <div className="flex justify-between"><span className="text-white/55">Contact</span><strong>{order.contactEmail}</strong></div>
          <div className="flex justify-between"><span className="text-white/55">Monthly</span><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div className="flex justify-between"><span className="text-white/55">Contract</span><strong>{order.quoteTerm} months</strong></div>
        </div>

        <div className="mt-3 pt-3 space-y-1" style={{ borderTop: "1px solid hsl(252, 50%, 28%)" }}>
          {order.selectedProducts.map((p, i) => (
            <div key={i} className="flex justify-between text-xs text-purple-200">
              <span>{p.name} ×{p.quantity}</span>
              <span>{p.monthlyTotal ? `£${p.monthlyTotal.toFixed(2)}/mo` : 'POA'}</span>
            </div>
          ))}
        </div>
      </div>

      {order.requiresCallback && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "rgba(249,69,128,0.1)", border: "1px solid rgba(249,69,128,0.4)", color: "#f94580" }}>
          📞 Our team will call you within 4 hours to confirm your managed fibre installation date and pricing.
        </div>
      )}

      <div className="rounded-xl p-5 mt-2 text-sm" style={{ background: "hsl(252,60%,16%)", border: "1px solid hsl(252,50%,28%)" }}>
        <h3 className="text-2xl font-bold text-white mb-4 text-left">What happens next?</h3>
        <div className="space-y-4">
          {[
            `Your order is being processed — a confirmation will be sent to ${order.contactEmail} shortly.`,
            'Your dedicated account manager will call you within 1 business day to walk you through the next steps.',
            "An engineer will be scheduled for installation. You'll receive a date confirmation by email.",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-4 text-left">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5"
                style={{ background: '#f94580', minWidth: '1.5rem' }}>{i + 1}</span>
              <p className="text-white/75 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid hsl(252,50%,28%)" }}>
          <span className="text-white/40 text-xs">Need to speak to us now?</span>
          <a href="tel:01274952123" className="text-[#7be7ff] text-xs font-semibold hover:underline">01274 952 123</a>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const defaultOrder: OrderState = {
  businessType: 'ltd',
  companyName: '', companyNumber: '', companyReference: '', registeredAddress: undefined,
  incorporatedDate: '', companyStatus: '', contactName: '', contactEmail: '', contactPhone: '',
  siteAddressLine1: '', siteAddressLine2: '', siteCity: '', sitePostcode: '', selectedProducts: [], requiresCallback: false, quoteReference: '',
  quoteTerm: 36, monthlyTotal: 0, annualTotal: 0, quoteSent: false, signedName: '',
  signedAt: '', ddAccountHolder: '', ddSortCode: '', ddAccountNumberLast4: '',
  ddConfirmed: false, authorisedToSign: false,
}

export default function OrderPage() {
  const [step, setStep] = useState(-2)
  const [journey, setJourney] = useState<Journey | null>(null)
  const [order, setOrderState] = useState<OrderState>(defaultOrder)

  function setOrder(partial: Partial<OrderState>) {
    setOrderState(prev => ({ ...prev, ...partial }))
  }

  function next() {
    setStep(s => {
      const n = s + 1
      // VoIP/Mobile: skip step 2 (products selector — already configured in builder)
      if ((journey === 'voip' || journey === 'mobile') && n === 2) return 3
      return Math.min(n, 7)
    })
  }
  function back() {
    setStep(s => {
      const n = s - 1
      // VoIP/Mobile: skip step 2 when going back from quote
      if ((journey === 'voip' || journey === 'mobile') && n === 2) return 1
      return Math.max(n, -2)
    })
  }

  function selectJourney(j: Journey) {
    setJourney(j)
    if (j === 'internet') {
      setStep(-1) // go to postcode checker
    } else {
      setStep(-1) // show callback form
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(252, 92%, 10%)" }}>
      <MarketingNavbar />
      <div className="pt-20 py-6 px-4 sm:py-10 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {step === -2 && <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>How can we help?</h1>}
          {step === -1 && journey === 'internet' && <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Availability Checker</h1>}
          {step === -1 && journey === 'voip' && <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>VoIP Phone System</h1>}
          {step === -1 && journey === 'mobile' && <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Mobile SIMs</h1>}
          {step === -1 && journey && journey !== 'internet' && journey !== 'voip' && journey !== 'mobile' && <h1 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Visby CF', 'Poppins', sans-serif" }}>Book a Callback</h1>}
          {step >= 0 && <h1 className="text-lg font-semibold text-white">Get Connected</h1>}
        </div>

        {/* Journey selector */}
        {step === -2 && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
            <JourneySelector onSelect={selectJourney} />
          </div>
        )}

        {/* VoIP builder */}
        {step === -1 && journey === 'voip' && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
            <VoIPBuilder
              onBack={() => setStep(-2)}
              onComplete={(products, voipTerm) => {
                setOrder({ selectedProducts: products.map(p => ({ ...p, quantity: (p as unknown as {quantity?: number}).quantity ?? 1, unitMonthly: (p as unknown as {monthlyCost?: number}).monthlyCost ?? 0, monthlyTotal: (p as unknown as {monthlyTotal?: number}).monthlyTotal ?? 0 })), leaseLine: { bandwidth: 0, term: voipTerm, monthlyPrice: 0, setupFee: 0 } })
                next()
              }}
            />
          </div>
        )}

        {/* Mobile builder */}
        {step === -1 && journey === 'mobile' && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
            <MobileBuilder
              onBack={() => setStep(-2)}
              onComplete={(products, mobileTerm) => {
                setOrder({ selectedProducts: products.map(p => ({ ...p, quantity: (p as unknown as {quantity?: number}).quantity ?? 1, unitMonthly: (p as unknown as {monthlyCost?: number}).monthlyCost ?? 0, monthlyTotal: (p as unknown as {monthlyTotal?: number}).monthlyTotal ?? 0 })), leaseLine: { bandwidth: 0, term: mobileTerm, monthlyPrice: 0, setupFee: 0 } })
                next()
              }}
            />
          </div>
        )}

        {/* Non-internet callback form (pstn only now) */}
        {step === -1 && journey && journey !== 'internet' && journey !== 'voip' && journey !== 'mobile' && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
            <CallbackForm journey={journey} onBack={() => setStep(-2)} />
          </div>
        )}

        {/* Postcode checker — internet only */}
        {step === -1 && journey === 'internet' && (
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
            <Step0 order={order} setOrder={setOrder} onNext={next} onBack={() => setStep(-2)} />
          </div>
        )}

        {/* Onboarding wizard — step bar + steps */}
        {step >= 0 && (
          <>
            <StepIndicator current={step} journey={journey} />
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
              {step === 0 && <Step1 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 1 && <Step2 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 2 && <Step3 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 3 && <Step4 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 4 && <Step5 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 5 && <Step6 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
              {step === 6 && <Step7 order={order} />}
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          ITC Telecoms Ltd · All data is encrypted and securely stored
        </p>
      </div>
      </div>
    </div>
  )
}
