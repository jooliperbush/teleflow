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
  selectedAddress?: { goldAddressKey: string; districtCode: string; displayAddress: string }
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

const STEPS = ['Company', 'Availability', 'Quote', 'Sign', 'Direct Debit', 'Confirm']

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

// ─── Step 1: Company Details ──────────────────────────────────────────────────

function Step1({ order, setOrder, onNext }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
}) {
  const [query, setQuery] = useState(order.companyName || '')
  const [results, setResults] = useState<CompanyResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const justSelected = useRef(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (justSelected.current) { justSelected.current = false; return }
    if (q.length < 2) { setResults([]); setShowDropdown(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/companies-house?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.items || [])
      setShowDropdown(true)
    } catch { setResults([]) }
    setSearching(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectCompany(c: CompanyResult) {
    const ref = generateCompanyRef(c.title, c.date_of_creation || '')
    setOrder({
      companyName: c.title,
      companyNumber: c.company_number,
      companyReference: ref,
      registeredAddress: c.registered_office_address,
      incorporatedDate: c.date_of_creation || '',
      companyStatus: c.company_status || '',
    })
    justSelected.current = true
    setQuery(c.title)
    setShowDropdown(false)
    setResults([])
  }

  const canContinue = order.companyName && order.companyNumber && order.contactName && order.contactEmail && order.sitePostcode

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" >Company Details</h2>
      <p className="text-purple-300 text-sm mb-6">We&apos;ll verify your company using Companies House.</p>

      <div className="relative mb-4" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
          placeholder="Start typing company name..."
          className="w-full rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 text-white placeholder-purple-300" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 30%)" }}
          style={{ '--tw-ring-color': NAVY } as React.CSSProperties}
        />
        {searching && <div className="absolute right-3 top-9 text-gray-400 text-xs">Searching...</div>}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
            {results.map(c => (
              <button
                key={c.company_number}
                onClick={() => selectCompany(c)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0"
              >
                <div className="font-medium text-sm">{c.title}</div>
                <div className="text-xs text-purple-400">{c.company_number} · {c.registered_office_address?.postal_code}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {order.companyNumber && (
        <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 28%)" }}>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Number</span><br /><strong>{order.companyNumber}</strong></div>
            <div><span className="text-gray-500">Reference</span><br /><strong>{order.companyReference}</strong></div>
            <div className="col-span-2">
              <span className="text-gray-500">Registered Address</span><br />
              <strong>{[order.registeredAddress?.address_line_1, order.registeredAddress?.locality, order.registeredAddress?.postal_code].filter(Boolean).join(', ')}</strong>
            </div>
            <div><span className="text-gray-500">Incorporated</span><br /><strong>{order.incorporatedDate}</strong></div>
            <div>
              <span className="text-gray-500">Status</span><br />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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

interface ZenAddress {
  goldAddressKey: string
  districtCode: string
  uprn?: string
  displayAddress: string
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
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries((order.selectedProducts || []).map(p => [p.type, true]))
  )
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

  function toggle(type: string) {
    setSelected(s => ({ ...s, [type]: !s[type] }))
  }


  function buildSelected(): SelectedProduct[] {
    return products
      .filter(p => selected[p.type])
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
      requiresCallback: selected['lease_line'] || false,
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
              className="w-full text-left rounded-xl px-5 py-4 transition-all text-base text-white" style={{ background: "hsl(252, 60%, 16%)", border: "1.5px solid hsl(252, 50%, 28%)" }} onMouseOver={(e) => (e.currentTarget.style.borderColor = "#f94580")} onMouseOut={(e) => (e.currentTarget.style.borderColor = "hsl(252, 50%, 28%)")}
              style={{ borderColor: '#E5E7EB' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = NAVY)}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#E5E7EB')}>
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
            <div key={p.type} onClick={() => toggle(p.type)}
              className="border-2 rounded-xl p-5 cursor-pointer transition-all hover:border-blue-400 hover:shadow-sm"
              style={selected[p.type] ? { borderColor: "#f94580", background: "hsl(260, 80%, 20%)" } : { borderColor: "hsl(252, 50%, 28%)", background: "hsl(252, 60%, 16%)" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selected[p.type] ? NAVY : '#D1D5DB', background: selected[p.type] ? NAVY : 'white' }}>
                      {selected[p.type] && <span className="text-white text-xs leading-none">✓</span>}
                    </div>
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>

                  {/* Broadband speed info */}
                  {['fttp','fttc','sogea','gfast','adsl'].includes(p.type) && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">{p.downloadMbps}/{p.uploadMbps} Mbps · Engineer installation required</p>
                  )}

                  {/* Lease line — callback required for quote */}
                  {p.type === 'lease_line' && selected['lease_line'] && (
                    <div className="ml-6 mt-2" onClick={e => e.stopPropagation()}>
                      <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(249, 69, 128, 0.1)", border: "1px solid rgba(249, 69, 128, 0.4)", color: "#f94580" }}>
                        📞 An ITC advisor will call you within 1 business day to discuss bandwidth options and pricing.
                      </p>
                    </div>
                  )}

                  {/* VoIP seats */}
                  {p.type === 'voip' && selected['voip'] && (
                    <div className="ml-6 mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-purple-200">Seats:</label>
                      <input type="number" min={1} max={100} value={voipSeats}
                        onChange={e => setVoipSeats(Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-sm" />
                      <span className="text-xs text-purple-400">× £{(8 * MARGIN).toFixed(2)}/mo</span>
                    </div>
                  )}

                  {/* Mobile SIMs */}
                  {p.type === 'mobile' && selected['mobile'] && (
                    <div className="ml-6 mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-purple-200">SIMs:</label>
                      <input type="number" min={1} max={500} value={mobileSims}
                        onChange={e => setMobileSims(Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1 text-sm" />
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
              const sel = products.filter(p => selected[p.type])
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
        <label className="text-sm font-medium text-gray-700">Contract Term:</label>
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

      <div className="border rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: NAVY, color: 'white' }}>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit/mo</th>
              <th className="px-4 py-3 text-right">Total/mo</th>
            </tr>
          </thead>
          <tbody>
            {order.selectedProducts.map((p, i) => (
              <tr key={i} className="border-t">
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
            <tr className="border-t bg-gray-50">
              <td colSpan={3} className="px-4 py-3 font-bold text-right">Monthly Total</td>
              <td className="px-4 py-3 font-bold text-right" >£{monthly.toFixed(2)}</td>
            </tr>
            <tr className="border-t bg-gray-50">
              <td colSpan={3} className="px-4 py-2 text-right text-gray-500 text-xs">Annual ({term} months)</td>
              <td className="px-4 py-2 text-right text-gray-500 text-xs">£{annual.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mb-6">
        <button
          onClick={emailQuote}
          disabled={sending || emailSent}
          className="w-full py-2.5 rounded-lg border-2 font-medium text-sm transition-all disabled:opacity-50"
          style={{ borderColor: NAVY, color: emailSent ? 'white' : NAVY, background: emailSent ? NAVY : 'transparent' }}
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
      <p className="text-gray-500 text-sm mb-4">Please review and sign the service agreement below.</p>

      <div className="rounded-lg p-4 mb-4 text-sm" style={{ background: "hsl(252, 60%, 18%)", border: "1px solid hsl(252, 50%, 28%)" }}>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div><span className="text-gray-500">Company</span><br /><strong>{order.companyName}</strong></div>
          <div><span className="text-gray-500">Quote Ref</span><br /><strong>{order.quoteReference}</strong></div>
          <div><span className="text-gray-500">Monthly Total</span><br /><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div><span className="text-gray-500">Contract</span><br /><strong>{order.quoteTerm} months</strong></div>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4 text-xs text-gray-600 max-h-40 overflow-y-auto leading-relaxed">
        <strong className="text-gray-800">Telecoms Service Agreement — Terms & Conditions</strong><br /><br />
        1. <strong>Service Provision.</strong> ITC Telecoms Ltd (&ldquo;the Provider&rdquo;) agrees to provide the telecommunications services specified in the quote (&ldquo;Services&rdquo;) to the customer named above (&ldquo;the Customer&rdquo;) subject to these terms.<br /><br />
        2. <strong>Contract Term & Billing.</strong> The minimum contract term is as specified in the quote. Monthly charges are invoiced in advance and collected via Direct Debit on the 1st of each month. Early termination fees apply equal to the remaining monthly charges in the contract term.<br /><br />
        3. <strong>Service Levels.</strong> The Provider will use reasonable endeavours to maintain service availability. Planned maintenance will be notified 48 hours in advance. The Provider&rsquo;s liability for service interruptions is limited to service credits as defined in the SLA.<br /><br />
        4. <strong>Fair Use.</strong> All services are subject to ITC Telecoms Fair Use Policy. Unlimited services apply to normal business use only.<br /><br />
        5. <strong>Data Protection.</strong> Both parties agree to comply with the UK GDPR and Data Protection Act 2018 in relation to any personal data processed under this agreement.<br /><br />
        6. <strong>Electronic Signature.</strong> This agreement is validly executed by electronic signature in accordance with the Electronic Communications Act 2000. The electronic signature below shall have the same legal effect as a handwritten signature.
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Type your full name to sign</label>
        <input
          value={signedName}
          onChange={e => setSignedName(e.target.value)}
          placeholder="Your full name"
          disabled={signed}
          className="w-full border rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 disabled:bg-gray-50"
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
        <span className="text-sm text-gray-600">
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
        <button onClick={onBack} disabled={signed} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm disabled:opacity-40">← Back</button>
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
      <p className="text-gray-500 text-sm mb-4">
        Monthly payment of <strong>£{order.monthlyTotal?.toFixed(2)}</strong> will be collected on the 1st of each month.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
          <input
            value={accountHolder}
            onChange={e => setAccountHolder(e.target.value)}
            disabled={confirmed}
            placeholder="Name on bank account"
            className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
            <input
              value={sortCode}
              onChange={e => setSortCode(formatSortCode(e.target.value))}
              disabled={confirmed}
              placeholder="XX-XX-XX"
              className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
              disabled={confirmed}
              placeholder="12345678"
              className="w-full border rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={authorised} onChange={e => setAuthorised(e.target.checked)} disabled={confirmed} className="mt-0.5" />
        <span className="text-sm text-gray-600">
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
        <button onClick={onBack} disabled={confirmed} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm disabled:opacity-40">← Back</button>
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
      body: JSON.stringify({ orderId: order.id || 'preview', order }),
    })
      .then(r => r.json())
      .then(d => { if (d.success) setSynced(true) })
      .catch(() => {})
  }, [])

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#d1fae5' }}>
        <span className="text-4xl">✓</span>
      </div>

      <h2 className="text-2xl font-bold mb-2" >Order Confirmed!</h2>
      <p className="text-gray-500 mb-1">Reference: <strong>{order.quoteReference}</strong></p>
      {synced && <p className="text-xs text-green-600 mb-4">✓ Provisioning ticket created in ConnectWise</p>}

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-left mb-6">
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Company</span><strong>{order.companyName}</strong></div>
          <div className="flex justify-between"><span className="text-gray-500">Contact</span><strong>{order.contactEmail}</strong></div>
          <div className="flex justify-between"><span className="text-gray-500">Monthly</span><strong>£{order.monthlyTotal?.toFixed(2)}</strong></div>
          <div className="flex justify-between"><span className="text-gray-500">Contract</span><strong>{order.quoteTerm} months</strong></div>
        </div>

        <div className="mt-3 pt-3 border-t space-y-1">
          {order.selectedProducts.map((p, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-600">
              <span>{p.name} ×{p.quantity}</span>
              <span>{p.monthlyTotal ? `£${p.monthlyTotal.toFixed(2)}/mo` : 'POA'}</span>
            </div>
          ))}
        </div>
      </div>

      {order.requiresCallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
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
    setStep(s => Math.min(s + 1, 5))
    // Leaving Step 1 (postcode entry) — clear all downstream address/availability state
    // so a changed postcode doesn't carry over stale address/products
    if (current === 0) {
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
          <h1 className="text-lg font-semibold text-gray-700">Customer Onboarding Portal</h1>
        </div>

        <StepIndicator current={step} />

        {/* Step Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          {step === 0 && <Step1 order={order} setOrder={setOrder} onNext={next} />}
          {step === 1 && <Step2 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 2 && <Step3 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 3 && <Step4 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 4 && <Step5 order={order} setOrder={setOrder} onNext={next} onBack={back} />}
          {step === 5 && <Step6 order={order} />}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by TeleFlow · ITC Telecoms Ltd · All data is encrypted and securely stored
        </p>
      </div>
    </div>
  )
}
