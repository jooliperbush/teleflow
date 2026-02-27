export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { ZenProduct } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
const MARGIN = 1.25

// ITC base pricing by download speed tier (Zen doesn't return prices in availability)
function baseMonthlyBySpeed(dlMbps: number, type: string): number {
  if (type === 'adsl')  return 18
  if (type === 'fttc' || type === 'sogea') return dlMbps >= 80 ? 26 : 22
  if (type === 'gfast') return 32
  // FTTP / CityFibre tiers
  if (dlMbps >= 2000) return 120
  if (dlMbps >= 1000) return 85
  if (dlMbps >= 500)  return 65
  if (dlMbps >= 300)  return 52
  if (dlMbps >= 200)  return 44
  if (dlMbps >= 100)  return 36
  if (dlMbps >= 50)   return 28
  if (dlMbps >= 30)   return 24
  return 20
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

    const products = result.products.map((p: ZenProduct) => {
      const base = baseMonthlyBySpeed(p.downloadMbps, p.type)
      return {
        ...p,
        monthlyCost: +(base * MARGIN).toFixed(2),
        setupFee: p.setupFee ? +(p.setupFee * MARGIN).toFixed(2) : 0,
      }
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
