'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }
    window.location.href = '/account'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(252,92%,10%)', fontFamily: 'Poppins, sans-serif' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-white font-bold text-xl tracking-tight">ITC Telecoms</Link>
          <p className="text-white/40 text-sm mt-2">Sign in to view your saved quotes</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'hsl(252,60%,14%)', border: '1px solid hsl(252,50%,28%)' }}>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Email address"
              autoComplete="email"
              className="w-full px-3 py-3 rounded-lg text-sm text-white"
              style={{ background: 'hsl(252,60%,10%)', border: '1px solid hsl(252,50%,35%)', outline: 'none' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-3 py-3 rounded-lg text-sm text-white"
              style={{ background: 'hsl(252,60%,10%)', border: '1px solid hsl(252,50%,35%)', outline: 'none' }}
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="itc-gradient-btn w-full py-3 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <p className="text-center text-xs text-white/30 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/order" className="text-white/60 hover:text-white transition-colors">
              Get a quote
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
