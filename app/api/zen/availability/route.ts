export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { ZenProduct } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
const MARGIN = 1.25

const ITC_PRICING: Record<string, number> = {
  fttp: 36.00, fttc: 22.00, sogea: 24.00, gfast: 32.00, adsl: 16.00,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const uprn = searchParams.get('uprn')
  const cli = searchParams.get('cli') || undefined

  if (!uprn) return NextResponse.json({ error: 'uprn required' }, { status: 400 })
  if (!ZEN_CONFIGURED) return NextResponse.json({ error: 'Zen not configured' }, { status: 503 })

  try {
    const { checkAvailability } = await import('@/lib/zen')
    const result = await checkAvailability(uprn, cli)

    // ITC rule: only best broadband (sorted desc, take first)
    const best = result.products.length ? [result.products[0]] : []

    const products = best.map((p: ZenProduct) => {
      const base = ITC_PRICING[p.type] || 30
      const monthly = p.monthlyCost ? +(p.monthlyCost * MARGIN).toFixed(2) : +(base * MARGIN).toFixed(2)
      return { ...p, monthlyCost: monthly, setupFee: p.setupFee ? +(p.setupFee * MARGIN).toFixed(2) : 0 }
    })

    return NextResponse.json({
      products,
      availabilityReference: result.availabilityReference,
      remainingChecks: result.remainingChecks,
      source: 'zen',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
