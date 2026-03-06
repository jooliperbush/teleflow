'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface QuoteProduct {
  name: string
  quantity: number
  monthlyTotal?: number
}

interface Quote {
  id: string
  quote_ref: string
  created_at: string
  snapshot: {
    companyName?: string
    monthly?: number
    annual?: number
    term?: number
    selectedProducts?: QuoteProduct[]
    siteAddressLine1?: string
    siteCity?: string
    sitePostcode?: string
  }
}

export default function AccountPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/quotes')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setQuotes(data.quotes || [])
        setEmail(data.email || '')
      })
      .catch(() => setError('Failed to load quotes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'hsl(252,92%,10%)', fontFamily: 'Poppins, sans-serif' }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'hsl(252,50%,22%)' }}>
        <Link href="/" className="text-white font-bold text-lg tracking-tight">ITC Telecoms</Link>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/'
          }}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Your Quotes</h1>
          {email && <p className="text-sm text-white/50 mt-1">{email}</p>}
        </div>

        {loading && (
          <div className="text-white/40 text-sm">Loading your quotes...</div>
        )}

        {error && (
          <div className="rounded-xl p-4" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(0,60%,40%)' }}>
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-white/40 text-xs mt-1">If this persists, email adminteam@clickitc.co.uk with your quote reference.</p>
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <div className="rounded-xl p-8 text-center" style={{ background: 'hsl(252,60%,16%)', border: '1px solid hsl(252,50%,28%)' }}>
            <p className="text-white/60 text-sm mb-4">No saved quotes yet.</p>
            <Link href="/order" className="itc-gradient-btn px-6 py-2.5 rounded-lg font-semibold text-white text-sm inline-block">
              Get a Quote →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {quotes.map(q => {
            const s = q.snapshot
            const site = [s.siteAddressLine1, s.siteCity, s.sitePostcode].filter(Boolean).join(', ')
            return (
              <div key={q.id} className="rounded-xl p-5" style={{ background: 'hsl(252,60%,14%)', border: '1px solid hsl(252,50%,28%)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{s.companyName || 'Your Quote'}</p>
                    {site && <p className="text-xs text-white/40 mt-0.5">{site}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">Ref: {q.quote_ref}</p>
                    <p className="text-xs text-white/40">{new Date(q.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Products */}
                {s.selectedProducts && s.selectedProducts.length > 0 && (
                  <div className="mb-3 flex flex-col gap-1">
                    {s.selectedProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{p.name} ×{p.quantity}</span>
                        <span className="text-white/50">{p.monthlyTotal != null ? `£${p.monthlyTotal.toFixed(2)}/mo` : 'POA'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid hsl(252,50%,25%)' }}>
                  <div>
                    <p className="text-white font-bold">£{s.monthly?.toFixed(2)}<span className="text-white/40 font-normal text-xs">/mo</span></p>
                    <p className="text-xs text-white/40">{s.term}-month contract · £{s.annual?.toFixed(2)}/yr</p>
                  </div>
                  <Link
                    href="/order"
                    className="itc-gradient-btn px-4 py-2 rounded-lg font-semibold text-white text-sm"
                  >
                    Continue Order →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
