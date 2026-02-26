'use client'

import { useState, useEffect, useCallback } from 'react'

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
  type: 'broadband' | 'lease_line' | 'voip' | 'mobile'
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

const NAVY = '#1B2A6B'

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
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto">
      {STEPS.map((label, i) => {
        const isActive = i === current
        const isDone = i < current
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all"
                style={{
                  background: isDone || isActive ? NAVY : 'white',
                  borderColor: isDone || isActive ? NAVY : '#D1D5DB',
                  color: isDone || isActive ? 'white' : '#9CA3AF',
                }}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block" style={{ color: isActive ? NAVY : '#9CA3AF', fontWeight: isActive ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 sm:w-12 h-0.5 mx-1 mb-4" style={{ background: i < current ? NAVY : '#E5E7EB' }} />
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

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
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
    setQuery(c.title)
    setShowDropdown(false)
  }

  const canContinue = order.companyName && order.companyNumber && order.contactName && order.contactEmail && order.sitePostcode

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Company Details</h2>
      <p className="text-gray-500 text-sm mb-6">We&apos;ll verify your company using Companies House.</p>

      <div className="relative mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
          placeholder="Start typing company name..."
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
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
                <div className="text-xs text-gray-400">{c.company_number} · {c.registered_office_address?.postal_code}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {order.companyNumber && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
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
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: NAVY }}
      >
        Check Availability →
      </button>
    </div>
  )
}

// ─── Step 2: Availability ─────────────────────────────────────────────────────

function Step2({ order, setOrder, onNext, onBack }: {
  order: OrderState
  setOrder: (o: Partial<OrderState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [voipSeats, setVoipSeats] = useState(1)
  const [mobileSims, setMobileSims] = useState(1)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch(`/api/zen/availability?postcode=${encodeURIComponent(order.sitePostcode)}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [order.sitePostcode])

  function toggle(type: string) {
    setSelected(s => ({ ...s, [type]: !s[type] }))
  }

  function buildSelected(): SelectedProduct[] {
    return products
      .filter(p => selected[p.type])
      .map(p => {
        const qty = p.type === 'voip' ? voipSeats : p.type === 'mobile' ? mobileSims : 1
        const unitMonthly = p.monthlyCost ? p.monthlyCost * MARGIN : 0
        return {
          type: p.type,
          name: p.name,
          quantity: qty,
          unitMonthly,
          monthlyTotal: unitMonthly * qty,
          requiresCallback: p.requiresCallback,
        }
      })
  }

  function handleNext() {
    const sel = buildSelected()
    const requiresCallback = sel.some(p => p.requiresCallback)
    setOrder({ selectedProducts: sel, requiresCallback })
    onNext()
  }

  const hasSelection = Object.values(selected).some(Boolean)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" style={{ borderTopColor: NAVY }} />
        <p className="text-gray-500">Checking availability for {order.sitePostcode}...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Available Products</h2>
      <p className="text-gray-500 text-sm mb-6">Showing best available options for <strong>{order.sitePostcode}</strong></p>

      <div className="space-y-3 mb-6">
        {products.map(p => (
          <div
            key={p.type}
            onClick={() => toggle(p.type)}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selected[p.type] ? 'border-blue-700 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            style={selected[p.type] ? { borderColor: NAVY, background: '#f0f4ff' } : {}}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selected[p.type] ? NAVY : '#D1D5DB', background: selected[p.type] ? NAVY : 'white' }}
                  >
                    {selected[p.type] && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="font-semibold text-sm">{p.name}</span>
                  {p.requiresCallback && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Callback required</span>
                  )}
                </div>

                {p.type === 'broadband' && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">{p.downloadMbps}/{p.uploadMbps} Mbps · Full Fibre</p>
                )}
                {p.type === 'lease_line' && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">Our team will call to confirm pricing and installation date</p>
                )}

                {p.type === 'voip' && selected['voip'] && (
                  <div className="ml-6 mt-2 flex items-center gap-2">
                    <label className="text-xs text-gray-600">Seats:</label>
                    <input
                      type="number"
                      min={1} max={100}
                      value={voipSeats}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setVoipSeats(Number(e.target.value))}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}

                {p.type === 'mobile' && selected['mobile'] && (
                  <div className="ml-6 mt-2 flex items-center gap-2">
                    <label className="text-xs text-gray-600">SIMs:</label>
                    <input
                      type="number"
                      min={1} max={500}
                      value={mobileSims}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setMobileSims(Number(e.target.value))}
                      className="w-16 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="text-right ml-4">
                {p.monthlyCost ? (
                  <>
                    <div className="font-bold text-sm" style={{ color: NAVY }}>£{(p.monthlyCost * MARGIN).toFixed(2)}</div>
                    <div className="text-xs text-gray-400">/ month</div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400">POA</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm">← Back</button>
        <button
          onClick={handleNext}
          disabled={!hasSelection}
          className="flex-1 py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: NAVY }}
        >
          Get Quote →
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
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Your Quote</h2>
      <p className="text-gray-500 text-sm mb-2">Ref: <strong>{quoteRef}</strong> · Valid 30 days</p>

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
              <td className="px-4 py-3 font-bold text-right" style={{ color: NAVY }}>£{monthly.toFixed(2)}</td>
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
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm">← Back</button>
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
        body: JSON.stringify({ orderId: order.id || 'preview', signedName }),
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
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Sign Agreement</h2>
      <p className="text-gray-500 text-sm mb-4">Please review and sign the service agreement below.</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
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
            className="flex-1 py-3 rounded-lg font-semibold text-white disabled:opacity-40"
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
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Direct Debit Setup</h2>
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
          ✓ Direct Debit authorised for account ending <strong>****{order.ddAccountNumberLast4}</strong>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={confirmed} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium text-sm disabled:opacity-40">← Back</button>
        {!confirmed ? (
          <button
            onClick={handleSetup}
            disabled={!canSubmit || submitting}
            className="flex-1 py-3 rounded-lg font-semibold text-white disabled:opacity-40"
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

      <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>Order Confirmed!</h2>
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

      <p className="text-sm text-gray-500">A confirmation has been sent to <strong>{order.contactEmail}</strong></p>
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

  function next() { setStep(s => Math.min(s + 1, 5)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
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
