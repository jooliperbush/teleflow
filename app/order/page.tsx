'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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

interface ZenAddress {
  goldAddressKey: string
  districtCode: string
  uprn: string
  displayAddress: string
}

interface OrderState {
  id?: string
  // Step 1
  companyName: string
  companyNumber: string
  companyReference: string
  registeredAddress: CompanyResult['registered_office_address']
  incorporatedDate: string
  companyStatus: string
  contactName: string
  contactEmail: string
  contactPhone: string
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
  // Step 4
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

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS = ['Check', 'Company', 'Availability', 'Quote', 'Sign', 'Direct Debit', 'Confirm']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
      {STEPS.map((label, i) => {
        const isActive = i === current
        const isDone = i < current
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
            {i < STEPS.length - 1 && (
              <div className="w-10 sm:w-16 h-0.5 mx-1 mb-5" style={{ background: i < current ? "#f94580" : "hsl(252, 50%, 28%)" }} />
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

        return (
          <div
            key={tier.id}
            className="rounded-2xl flex flex-col"
            style={{
              background: isFeatured ? 'hsl(252, 60%, 15%)' : 'hsl(252, 60%, 13%)',
              border: isFeatured
                ? '1.5px solid transparent'
                : '1px solid hsl(252, 50%, 24%)',
              backgroundClip: 'padding-box',
              position: 'relative',
              padding: isFeatured ? '1.5px' : '0',
            }}
          >
            {isFeatured && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '1rem', zIndex: 0,
                background: 'linear-gradient(135deg, #f94580, #591bff)',
                padding: '1.5px',
              }} />
            )}
            <div
              className="rounded-2xl flex flex-col flex-1 p-5"
              style={{
                background: isFeatured ? 'hsl(252, 60%, 13%)' : 'transparent',
                position: 'relative', zIndex: 1,
              }}
            >
              {isFeatured && (
                <div className="self-start mb-3 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f94580, #591bff)' }}>
                  Most Popular
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: tier.color }}>{tier.name}</p>

              <div className="mb-1">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Visby CF Bold, sans-serif', letterSpacing: '-0.03em' }}>
                  {speedLabel(speeds[0])}
                </span>
                {speeds.length > 1 && (
                  <span className="text-sm text-purple-400 ml-1">– {speedLabel(speeds[speeds.length - 1])}</span>
                )}
              </div>

              <p className="text-purple-400 text-xs mb-4 leading-relaxed">{tier.positioning}</p>

              <div className="w-full h-px mb-4" style={{ background: 'hsl(252, 50%, 22%)' }} />

              <ul className="space-y-2 flex-1 mb-4">
                {tier.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm text-purple-200">
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill={tier.color} fillOpacity="0.15"/>
                      <path d="M4 7l2 2 4-4" stroke={tier.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              {speeds.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {speeds.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: 'hsl(252, 60%, 20%)', color: tier.color, border: '1px solid hsl(252, 50%, 28%)' }}>
                      {speedLabel(s)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 0: Availability Checker ────────────────────────────────────────────

function Step0({ order, setOrder, onNext }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
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
      const res = await fetch(`/api/zen/availability?uprn=${encodeURIComponent(addr.uprn)}`)
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
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(123,231,255,0.12)', border: '1px solid rgba(123,231,255,0.3)' }}>
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Visby CF Bold, Poppins, sans-serif' }}>ITC Availability Checker</h2>
        <p className="text-purple-300">Enter your business postcode to see what's available at your address.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={postcode}
          onChange={e => { setPostcode(e.target.value.toUpperCase()); setChecked(false); setProducts([]); setAddresses([]) }}
          onKeyDown={e => e.key === 'Enter' && checkPostcode()}
          placeholder="e.g. BD1 1AA"
          maxLength={8}
          className="flex-1 rounded-xl px-4 py-3 text-base text-white placeholder-purple-400 font-medium tracking-widest"
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
          <p className="text-purple-300 text-sm mb-2">Select your address:</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(252, 50%, 28%)' }}>
            {addresses.map((a, i) => (
              <button
                key={a.uprn}
                onClick={() => selectAddress(a)}
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
          {hasProducts ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-white font-semibold">Great news! {broadband.length} plan{broadband.length !== 1 ? 's' : ''} available at your address.</p>
              </div>

              <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(249,69,128,0.15), rgba(89,27,255,0.15))', border: '1px solid rgba(249,69,128,0.4)' }}>
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-white font-semibold text-sm">Limited time offer</p>
                  <p className="text-purple-200 text-sm">Order now and receive a <span className="text-pink-400 font-bold">FREE 30-day unlimited data SIM</span> — no strings attached.</p>
                </div>
              </div>

              <TierCards products={broadband} />

              <div className="rounded-xl p-5 mb-6 text-center" style={{ background: 'rgba(89,27,255,0.15)', border: '1px solid rgba(89,27,255,0.4)' }}>
                <p className="text-white font-semibold mb-1">Ready to get connected?</p>
                <p className="text-purple-300 text-sm mb-4">Complete your order in minutes. Our team handles the rest.</p>
                <button
                  onClick={onNext}
                  className="itc-gradient-btn px-8 py-3 rounded-xl font-semibold text-white text-base"
                >
                  Start Your Order →
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(249,69,128,0.08)', border: '1px solid rgba(249,69,128,0.3)' }}>
              <p className="text-white font-semibold mb-2">No broadband plans found</p>
              <p className="text-purple-300 text-sm mb-4">We may still be able to help with a managed fibre or leased line solution.</p>
              <button
                onClick={onNext}
                className="px-8 py-3 rounded-xl font-medium text-white text-sm"
                style={{ border: '1px solid rgba(249,69,128,0.5)', background: 'transparent' }}
              >
                Talk to an advisor →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Step 1: Company Details ──────────────────────────────────────────────────

function Step1({ order, setOrder, onNext }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
}) {
  const [companyNumber, setCompanyNumber] = useState(order.companyNumber || '')
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState('')

  async function lookupByNumber(num: string) {
    const clean = num.replace(/\s/g, '').toUpperCase()
    if (clean.length < 7) return
    setLooking(true)
    setLookupError('')
    try {
      const res = await fetch(`/api/companies-house/number?number=${encodeURIComponent(clean)}`)
      if (!res.ok) throw new Error('not found')
      const c: CompanyResult = await res.json()
      if (!c.title) throw new Error('not found')
      const ref = generateCompanyRef(c.title, c.date_of_creation || '')
      setOrder({
        companyName: c.title,
        companyNumber: c.company_number,
        companyReference: ref,
        registeredAddress: c.registered_office_address,
        incorporatedDate: c.date_of_creation || '',
        companyStatus: c.company_status || '',
      })
    } catch {
      setLookupError('Company not found. Please check the number and try again.')
      setOrder({ companyName: '', companyNumber: '', companyStatus: '' })
    }
    setLooking(false)
  }

  const canContinue = order.companyName && order.companyNumber && order.companyStatus === 'active' && order.contactName && order.contactEmail && order.sitePostcode

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Company Details</h2>
      <p className="text-purple-300 text-sm mb-6">Enter your Companies House registration number to get started.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-purple-200 mb-1">Companies House Number</label>
        <div className="flex gap-2">
          <input
            value={companyNumber}
            onChange={e => {
              setCompanyNumber(e.target.value)
              setLookupError('')
              if (order.companyName) setOrder({ companyName: '', companyNumber: '', companyStatus: '' })
            }}
            onBlur={e => lookupByNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookupByNumber(companyNumber)}
            placeholder="e.g. 12345678"
            maxLength={8}
            className="flex-1 rounded-lg px-4 py-3 text-base focus:outline-none text-white placeholder-purple-300"
            style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 30%)" }}
          />
          <button
            onClick={() => lookupByNumber(companyNumber)}
            disabled={looking || companyNumber.length < 7}
            className="px-5 py-3 rounded-lg font-medium text-sm text-white disabled:opacity-40"
            style={{ background: "hsl(252, 60%, 25%)", border: "1px solid hsl(252, 50%, 35%)" }}
          >
            {looking ? '...' : 'Look up'}
          </button>
        </div>
        {lookupError && <p className="text-red-400 text-xs mt-2">{lookupError}</p>}
        {looking && <p className="text-purple-400 text-xs mt-2">Checking Companies House...</p>}
      </div>

      {order.companyName && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-200 mb-1">Company Name</label>
          <input
            readOnly
            value={order.companyName}
            className="w-full rounded-lg px-4 py-3 text-base text-white opacity-80 cursor-default"
            style={{ background: "hsl(252, 60%, 14%)", border: "1px solid hsl(252, 50%, 28%)" }}
          />
        </div>
      )}

      {order.companyNumber && (
        <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 28%)" }}>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-purple-300">Number</span><br /><strong>{order.companyNumber}</strong></div>
            <div><span className="text-purple-300">Reference</span><br /><strong>{order.companyReference}</strong></div>
            <div className="col-span-2">
              <span className="text-purple-300">Registered Address</span><br />
              <strong>{[order.registeredAddress?.address_line_1, order.registeredAddress?.locality, order.registeredAddress?.postal_code].filter(Boolean).join(', ')}</strong>
            </div>
            <div><span className="text-purple-300">Incorporated</span><br /><strong>{order.incorporatedDate}</strong></div>
            <div>
              <span className="text-purple-300">Status</span><br />
              <strong className={order.companyStatus === 'active' ? 'text-green-600' : 'text-red-600'}>
                {order.companyStatus?.toUpperCase()}
              </strong>
            </div>
          </div>
          {order.companyStatus !== 'active' && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs">
              ⚠️ This company is not active. Please verify before continuing.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Contact Name', key: 'contactName', type: 'text', placeholder: 'Full name' },
          { label: 'Contact Email', key: 'contactEmail', type: 'email', placeholder: 'email@company.com' },
          { label: 'Contact Phone', key: 'contactPhone', type: 'tel', placeholder: '07700 000000' },
          { label: 'Site Postcode', key: 'sitePostcode', type: 'text', placeholder: 'BD1 1AA' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-purple-200 mb-1">{label}</label>
            <input
              type={type}
              value={(order as unknown as Record<string, string>)[key] || ''}
              onChange={e => setOrder({ [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 text-white placeholder-purple-300" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 30%)" }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn"
        style={{ background: NAVY }}
      >
        Check Availability →
      </button>
    </div>
  )
}

// ─── Step 2: Availability (3 sub-phases) ────────────────────────────────────

interface AppointmentSlot {
  date: string
  startTime: string
  endTime: string
  type: string
}



function Step2({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [addresses, setAddresses] = useState<ZenAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<ZenAddress | null>(order.selectedAddress || null)
  const [products, setProducts] = useState<Product[]>([])
  const [availRef, setAvailRef] = useState<string | null>(order.zenAvailabilityRef || null)
  const [phase, setPhase] = useState<'address' | 'products' | 'appointment'>('address')
  const [loading, setLoading] = useState(false)
  const [voipSeats, setVoipSeats] = useState(1)
  const [mobileSims, setMobileSims] = useState(1)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  // Lease line — no live pricing (requires indirect-quote scope not yet enabled)
  const [selectedTerm, setSelectedTerm] = useState(order.leaseLine?.term || 36)
  // Appointment state
  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(order.appointment || null)

  // Load addresses on mount
  useEffect(() => {
    if (order.selectedAddress) return // already have address
    setLoading(true)
    fetch(`/api/zen/address?postcode=${encodeURIComponent(order.sitePostcode)}`)
      .then(r => r.json())
      .then(d => { setAddresses(d.addresses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [order.sitePostcode, order.selectedAddress])


  // Load appointment slots when entering appointment phase
  useEffect(() => {
    if (phase !== 'appointment' || slots.length > 0) return
    setSlotsLoading(true)
    const ref = availRef || 'MOCK'
    fetch(`/api/zen/appointments?availabilityReference=${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(d => { setSlots(d.slots || []); setSlotsLoading(false) })
      .catch(() => setSlotsLoading(false))
  }, [phase, availRef, slots.length])

  async function handleAddressSelect(addr: ZenAddress) {
    setSelectedAddress(addr)
    setOrder({ selectedAddress: addr })
    setLoading(true)
    setPhase('products')
    try {
      const uprnParam = addr.uprn ? `uprn=${encodeURIComponent(addr.uprn)}` : `postcode=${encodeURIComponent(order.sitePostcode)}`
      const res = await fetch(`/api/zen/availability?${uprnParam}`)
      const data = await res.json()
      const zenProducts: Product[] = (data.products || [])
      const allProducts: Product[] = [
        ...zenProducts,
        { type: 'lease_line', name: 'Managed Fibre', downloadMbps: 200, uploadMbps: 1000, monthlyCost: null, setupFee: null, available: true },
        { type: 'voip', name: 'VoIP Seat', monthlyCost: 8.00 * MARGIN, setupFee: 25.00, available: true },
        { type: 'mobile', name: 'O2 Unlimited SIM', monthlyCost: 15.00 * MARGIN, setupFee: 0, available: true },
      ]
      setProducts(allProducts)
      setAvailRef(data.availabilityReference || null)
      setOrder({ zenAvailabilityRef: data.availabilityReference || undefined })
    } catch { /* keep going */ }
    setLoading(false)
  }

  function toggle(key: string) {
    setSelected(s => ({ ...s, [key]: !s[key] }))
  }


  function buildSelected(): SelectedProduct[] {
    return products
      .filter(p => selected[p.name])
      .map(p => {
        if (p.type === 'lease_line') {
          return {
            type: p.type,
            name: 'Managed Fibre (Leased Line)',
            quantity: 1,
            unitMonthly: 0,
            monthlyTotal: 0,
            requiresCallback: true,
          }
        }
        const qty = p.type === 'voip' ? voipSeats : p.type === 'mobile' ? mobileSims : 1
        const unitMonthly = p.monthlyCost || 0
        return { type: p.type, name: p.name, quantity: qty, unitMonthly, monthlyTotal: unitMonthly * qty }
      })
  }

  function handleProductsNext() {
    const sel = buildSelected()
    setOrder({
      selectedProducts: sel,
      requiresCallback: products.some(p => p.type === 'lease_line' && selected[p.name]) || false,
      leaseLine: undefined,
    })
    // Show appointment picker if broadband or lease line selected
    const needsInstall = sel.some(p => ['fttp','fttc','sogea','gfast','adsl','lease_line'].includes(p.type))
    if (needsInstall) {
      setPhase('appointment')
    } else {
      onNext()
    }
  }

  function handleAppointmentNext() {
    setOrder({ appointment: selectedSlot || undefined })
    onNext()
  }

  const hasSelection = Object.values(selected).some(Boolean)
  const leaseLineReady = true // lease line goes to callback, no quote needed

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 rounded-full animate-spin mb-3" style={{ borderColor: "hsl(252, 50%, 28%)", borderTopColor: "#f94580" }} />
        <p className="text-purple-300 text-sm">
          {phase === 'address'
            ? `Finding addresses for ${order.sitePostcode}...`
            : `Checking availability at ${selectedAddress?.displayAddress}...`}
        </p>
      </div>
    )
  }

  // ── Phase 1: Address picker ──────────────────────────────────────────────────
  if (phase === 'address') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2" >Select Installation Address</h2>
        <p className="text-purple-300 text-sm mb-5">
          Addresses found for <strong>{order.sitePostcode}</strong>. Select the exact installation address.
        </p>
        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
          {addresses.length === 0 ? (
            <p className="text-purple-400 text-sm text-center py-8">No addresses found for this postcode.</p>
          ) : addresses.map(a => (
            <button key={a.goldAddressKey} onClick={() => handleAddressSelect(a)}
              className="w-full text-left rounded-xl px-5 py-4 transition-all text-base text-white"
              style={{ background: "hsl(252, 60%, 16%)", border: "1.5px solid hsl(252, 50%, 28%)" }}
              onMouseOver={e => (e.currentTarget.style.borderColor = "#f94580")}
              onMouseOut={e => (e.currentTarget.style.borderColor = "hsl(252, 50%, 28%)")}>
              {a.displayAddress}
            </button>
          ))}
        </div>
        <button onClick={onBack} className="w-full py-4 rounded-xl font-medium text-base text-purple-200" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
      </div>
    )
  }

  // ── Phase 2: Product picker ──────────────────────────────────────────────────
  if (phase === 'products') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2" >Available Products</h2>
        <p className="text-purple-300 text-sm mb-1">{selectedAddress?.displayAddress}</p>
        <button onClick={() => { setPhase('address'); setProducts([]); setSelected({}) }}
          className="text-xs mb-5 underline" style={{ color: "#7be7ff" }}>
          ← Change address
        </button>

        <div className="space-y-3 mb-6">
          {products.map(p => (
            <div key={p.name} onClick={() => toggle(p.name)}
              className="border-2 rounded-xl p-5 cursor-pointer transition-all hover:border-blue-400 hover:shadow-sm"
              style={selected[p.name] ? { borderColor: "#f94580", background: "rgba(249, 69, 128, 0.08)", boxShadow: "0 0 0 1px #f94580" } : { borderColor: "hsl(252, 50%, 30%)", background: "hsl(252, 60%, 16%)" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selected[p.name] ? '#f94580' : 'hsl(252,50%,35%)', background: selected[p.name] ? '#f94580' : 'transparent' }}>
                      {selected[p.name] && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>

                  {/* Broadband speed info */}
                  {['fttp','fttc','sogea','gfast','adsl'].includes(p.type) && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">{p.downloadMbps}/{p.uploadMbps} Mbps · Engineer installation required</p>
                  )}

                  {/* Lease line — callback required for quote */}
                  {p.type === 'lease_line' && selected['Managed Fibre (Leased Line)'] && (
                    <div className="ml-6 mt-2" onClick={e => e.stopPropagation()}>
                      <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(249, 69, 128, 0.1)", border: "1px solid rgba(249, 69, 128, 0.4)", color: "#f94580" }}>
                        📞 An ITC advisor will call you within 1 business day to discuss bandwidth options and pricing.
                      </p>
                    </div>
                  )}

                  {/* VoIP seats */}
                  {p.type === 'voip' && selected[p.name] && (
                    <div className="ml-6 mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-purple-200">Seats:</label>
                      <input type="number" min={1} max={100} value={voipSeats}
                        onChange={e => setVoipSeats(Number(e.target.value))}
                        className="w-16 rounded px-2 py-1 text-sm text-white" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 30%)" }} />
                      <span className="text-xs text-purple-400">× £{(8 * MARGIN).toFixed(2)}/mo</span>
                    </div>
                  )}

                  {/* Mobile SIMs */}
                  {p.type === 'mobile' && selected[p.name] && (
                    <div className="ml-6 mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-purple-200">SIMs:</label>
                      <input type="number" min={1} max={500} value={mobileSims}
                        onChange={e => setMobileSims(Number(e.target.value))}
                        className="w-16 rounded px-2 py-1 text-sm text-white" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 30%)" }} />
                      <span className="text-xs text-purple-400">× £{(15 * MARGIN).toFixed(2)}/mo</span>
                    </div>
                  )}
                </div>

                {/* Price column */}
                <div className="text-right ml-4 flex-shrink-0">
                  {p.type === 'lease_line' ? (
                    <div className="text-xs text-purple-400">POA</div>
                  ) : p.monthlyCost ? (
                    <>
                      <div className="font-bold text-sm" >£{p.monthlyCost.toFixed(2)}</div>
                      <div className="text-xs text-purple-400">/ month</div>
                    </>
                  ) : (
                    <div className="text-xs text-purple-400">—</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setPhase('address'); setProducts([]); setSelected({}) }}
            className="flex-1 py-4 rounded-xl font-medium text-base text-purple-200" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
          <button onClick={handleProductsNext}
            disabled={!hasSelection || !leaseLineReady}
            className="flex-1 py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn disabled:opacity-40"
            style={{ background: NAVY }}>
            {(() => {
              const sel = products.filter(p => selected[p.name])
              const needsInstall = sel.some(p => ['fttp','fttc','sogea','gfast','adsl','lease_line'].includes(p.type))
              return needsInstall ? 'Book Installation →' : 'Get Quote →'
            })()}
          </button>
        </div>
      </div>
    )
  }

  // ── Phase 3: Appointment picker ──────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Book Installation</h2>
      <p className="text-purple-300 text-sm mb-6">
        Select an engineer appointment for <strong>{selectedAddress?.displayAddress}</strong>.
        Half-day slots available — engineer will arrive within the window.
      </p>

      {slotsLoading ? (
        <div className="text-center py-10">
          <div className="inline-block w-7 h-7 border-4 rounded-full animate-spin" style={{ borderColor: "hsl(252, 50%, 28%)", borderTopColor: "#f94580" }} />
          <p className="text-gray-400 text-sm mt-3">Fetching available slots from Zen...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-sm text-amber-800">
          No appointment slots are currently available. Our team will contact you to arrange installation.
        </div>
      ) : (
        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-1">
          {(() => {
            // Group slots by date
            const byDate: Record<string, AppointmentSlot[]> = {}
            slots.forEach(s => { byDate[s.date] = byDate[s.date] || []; byDate[s.date].push(s) })
            return Object.entries(byDate).map(([date, daySlots]) => (
              <div key={date}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 mt-3" style={{ color: "#7be7ff" }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {daySlots.map((slot, i) => {
                    const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime
                    return (
                      <button key={i} onClick={() => setSelectedSlot(slot)}
                        className="flex-1 min-w-[130px] border-2 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                        style={isSelected ? { borderColor: "#7be7ff", background: "rgba(123, 231, 255, 0.12)", color: "#7be7ff" } : { borderColor: "hsl(252, 50%, 30%)", color: "#c4b8f0", background: "hsl(252, 60%, 16%)" }}>
                        {slot.type === 'AM' ? '🌅' : '☀️'} {slot.type}
                        <span className="block text-xs font-normal text-gray-400">{slot.startTime}–{slot.endTime}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          })()}
        </div>
      )}

      {selectedSlot && (
        <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "rgba(123, 231, 255, 0.1)", border: "1px solid rgba(123, 231, 255, 0.4)", color: "#7be7ff" }}>
          ✓ {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} — {selectedSlot.type} ({selectedSlot.startTime}–{selectedSlot.endTime})
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => { setPhase('products'); setSelectedSlot(null) }}
          className="flex-1 py-4 rounded-xl font-medium text-base text-purple-200" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
        <button onClick={handleAppointmentNext}
          disabled={slots.length > 0 && !selectedSlot}
          className="flex-1 py-4 rounded-xl font-semibold text-white text-base itc-gradient-btn disabled:opacity-40"
          style={{ background: NAVY }}>
          {selectedSlot ? 'Get Quote →' : 'Skip — team will contact me'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Quote ────────────────────────────────────────────────────────────

function Step3({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [term, setTerm] = useState<number>(order.quoteTerm || 24)
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)

  const monthly = order.selectedProducts.reduce((sum, p) => sum + p.monthlyTotal, 0)
  const annual = monthly * 12
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
      <p className="text-purple-300 text-sm mb-2">Ref: <strong>{quoteRef}</strong> · Valid 30 days</p>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-purple-200">Contract Term:</label>
        {[12, 24, 36].map(t => (
          <button
            key={t}
            onClick={() => setTerm(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
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
            <tr style={{ borderTop: "1px solid hsl(252, 50%, 28%)", background: "hsl(252, 60%, 16%)" }}>
              <td colSpan={3} className="px-4 py-2 text-right text-purple-400 text-xs">Annual ({term} months)</td>
              <td className="px-4 py-2 text-right text-purple-400 text-xs">£{annual.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mb-6">
        <button
          onClick={emailQuote}
          disabled={sending || emailSent}
          className="w-full py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
          style={{ border: "1.5px solid #591bff", color: emailSent ? 'white' : '#7be7ff', background: emailSent ? '#591bff' : 'transparent' }}
        >
          {emailSent ? `✓ Quote sent to ${order.contactEmail}` : sending ? 'Sending...' : `📧 Email Quote to ${order.contactEmail}`}
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-xl font-medium text-base text-purple-200" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
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

// ─── Step 4: E-Signature ──────────────────────────────────────────────────────

function Step4({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [signedName, setSignedName] = useState(order.signedName || '')
  const [authorised, setAuthorised] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(!!order.signedAt)

  async function handleSign() {
    setSigning(true)
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || 'preview',
          signedName,
          order: {
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
          },
        }),
      })
      const data = await res.json()
      setOrder({ signedName, signedAt: data.signedAt })
      setSigned(true)
    } catch {
      setOrder({ signedName, signedAt: new Date().toISOString() })
      setSigned(true)
    }
    setSigning(false)
  }

  const canSign = signedName.trim().length > 2 && authorised && !signed

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Sign Agreement</h2>
      <p className="text-purple-300 text-sm mb-4">Please review and sign the service agreement below.</p>

      <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div><span className="text-purple-300">Company</span><br /><strong>{order.companyName}</strong></div>
          <div><span className="text-purple-300">Quote Ref</span><br /><strong>{order.quoteReference}</strong></div>
          <div><span className="text-purple-300">Monthly Total</span><br /><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div><span className="text-purple-300">Contract</span><br /><strong>{order.quoteTerm} months</strong></div>
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
        <label className="block text-sm font-medium text-purple-200 mb-1">Type your full name to sign</label>
        <input
          value={signedName}
          onChange={e => setSignedName(e.target.value)}
          placeholder="Your full name"
          disabled={signed}
          className="w-full border rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 disabled:opacity-50"
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

      <div className="flex gap-3">
        <button onClick={onBack} disabled={signed} className="flex-1 py-3 rounded-xl font-medium text-base text-purple-200 disabled:opacity-40" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
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

// ─── Step 5: Direct Debit ─────────────────────────────────────────────────────

function Step5({ order, setOrder, onNext, onBack }: {
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
          <label className="block text-sm font-medium text-purple-200 mb-1">Account Holder Name</label>
          <input
            value={accountHolder}
            onChange={e => setAccountHolder(e.target.value)}
            disabled={confirmed}
            placeholder="Name on bank account"
            className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Sort Code</label>
            <input
              value={sortCode}
              onChange={e => setSortCode(formatSortCode(e.target.value))}
              disabled={confirmed}
              placeholder="XX-XX-XX"
              className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Account Number</label>
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

      <div className="flex gap-3">
        <button onClick={onBack} disabled={confirmed} className="flex-1 py-3 rounded-xl font-medium text-base text-purple-200 disabled:opacity-40" style={{ border: "1px solid hsl(252, 50%, 35%)", background: "hsl(252, 60%, 18%)" }}>← Back</button>
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

// ─── Step 6: Confirmation ─────────────────────────────────────────────────────

function Step6({ order }: { order: OrderState }) {
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

      <h2 className="text-2xl font-bold mb-2" >Order Confirmed!</h2>
      <p className="text-gray-500 mb-1">Reference: <strong>{order.quoteReference}</strong></p>
      {synced && <p className="text-xs text-green-600 mb-4">✓ Provisioning ticket created in ConnectWise</p>}

      <div className="rounded-xl p-4 text-sm text-left mb-6" style={{ background: "hsl(252, 60%, 16%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-purple-300">Company</span><strong>{order.companyName}</strong></div>
          <div className="flex justify-between"><span className="text-purple-300">Contact</span><strong>{order.contactEmail}</strong></div>
          <div className="flex justify-between"><span className="text-purple-300">Monthly</span><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div className="flex justify-between"><span className="text-purple-300">Contract</span><strong>{order.quoteTerm} months</strong></div>
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

      <p className="text-sm text-purple-300">A confirmation has been sent to <strong>{order.contactEmail}</strong></p>
      <p className="text-sm text-gray-500 mt-1">Your account manager will be in touch within 24 hours.</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const defaultOrder: OrderState = {
  companyName: '', companyNumber: '', companyReference: '', registeredAddress: undefined,
  incorporatedDate: '', companyStatus: '', contactName: '', contactEmail: '', contactPhone: '',
  sitePostcode: '', selectedProducts: [], requiresCallback: false, quoteReference: '',
  quoteTerm: 24, monthlyTotal: 0, annualTotal: 0, quoteSent: false, signedName: '',
  signedAt: '', ddAccountHolder: '', ddSortCode: '', ddAccountNumberLast4: '',
  ddConfirmed: false,
}

export default function OrderPage() {
  const [step, setStep] = useState(0)
  const [order, setOrderState] = useState<OrderState>(defaultOrder)

  function setOrder(partial: Partial<OrderState>) {
    setOrderState(prev => ({ ...prev, ...partial }))
  }

  function next() {
    const current = step
    setStep(s => Math.min(s + 1, 6))
    // Leaving Step 1 (postcode entry) — clear all downstream address/availability state
    // so a changed postcode doesn't carry over stale address/products
    if (current === 1) {
      setOrder({
        selectedAddress: undefined,
        zenAvailabilityRef: undefined,
        selectedProducts: [],
        requiresCallback: false,
        appointment: undefined,
        leaseLine: undefined,
      })
    }
  }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: "hsl(252, 92%, 10%)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-full text-white text-sm font-bold mb-2" style={{ background: NAVY }}>
            ITC Telecoms
          </div>
          <h1 className="text-lg font-semibold text-white">Customer Onboarding Portal</h1>
        </div>

        <StepIndicator current={step} />

        {/* Step Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "hsl(252, 92%, 13%)", border: "1px solid hsl(252, 50%, 25%)" }}>
          {step === 0 && <Step0 order={order} setOrder={setOrder} onNext={next} />}
          {step === 1 && <Step1 order={order} setOrder={setOrder} onNext={next} />}
          {step === 2 && <Step2 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 3 && <Step3 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 4 && <Step4 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 5 && <Step5 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 6 && <Step6 order={order} />}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by TeleFlow · ITC Telecoms Ltd · All data is encrypted and securely stored
        </p>
      </div>
    </div>
  )
}
